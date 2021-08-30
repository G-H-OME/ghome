import bcrypt from 'bcryptjs'
import {
	Arg,
	Ctx,
	Field,
	InputType,
	Mutation,
	ObjectType,
	Resolver,
} from 'type-graphql'
import { User } from '../entities/User'
import { Mycontext } from '../mikro-orm.config'
import { isPhone } from '../utls/isPhone'
import { sendSMSToken } from '../utls/sendSms'
import { setAuth } from '../utls/setAuth'

@InputType()
class PhonePasswordInput {
	@Field()
	phone: string
	@Field()
	password: string
}

@InputType()
class PhoneTokenInput {
	@Field()
	phone: string
	@Field()
	token: string
}

@ObjectType()
export class FieldError {
	@Field()
	field: string
	@Field()
	message: string
}

@ObjectType()
export class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[]
	@Field(() => User, { nullable: true })
	user?: User
	static createError(field: string, message: string) {
		return {
			user: undefined,
			errors: [
				{
					field,
					message,
				},
			],
		}
	}
}

@Resolver(User)
export class UserResolver {
	@Mutation(() => UserResponse)
	async sendToken(
		@Arg('phone') phone: string,
		@Ctx() { redis }: Mycontext
	): Promise<UserResponse> {
		const token = new Array(6)
			.fill(null)
			.map(() => Math.floor(Math.random() * 9 + 1))
			.join('')

		const toShort = await redis.get(process.env.PHONE_TOKEN_AT_TIME_PREFIX + phone)
		if (toShort) {
			return UserResponse.createError('phone', '发送太频繁')
		}
		await redis.set(
			process.env.PHONE_TOKEN_AT_TIME_PREFIX + phone,
			123,
			'EX',
			parseInt(process.env.PHONE_TOKEN_FREQUENCY_SECONDS)
		)

		const setResult = await redis.set(
			process.env.PHONE_PREFIX + token,
			phone,
			'EX',
			parseInt(process.env.PHONE_TOKEN_EXPIRE_SECONDS)
		)
		if (setResult !== 'OK') {
			return UserResponse.createError('phone', '服务器出错')
		}
		await sendSMSToken({ phone, smsToken: token })
		return UserResponse.createError('phone', '发送完成')
	}

	@Mutation(() => UserResponse)
	async noPhoneLogin(
		@Ctx() { em, req }: Mycontext,
		@Arg('options') options: PhonePasswordInput
	): Promise<UserResponse> {
		const { phone, password } = options
		if (!password) {
			return UserResponse.createError('password', '请输入密码')
		}
		const user = await em.findOne(User, { phone })
		if (!user) {
			return UserResponse.createError('phone', '查无此用户')
		}
		if (!user.password) {
			return UserResponse.createError('phone', '手机注册用户请用手机验证码登陆')
		}
		const valid = await bcrypt.compare(password, user.password)
		if (!valid) {
			return UserResponse.createError('phone', '密码错误')
		}
		setAuth(req.session, user)
		return { user }
	}

	@Mutation(() => UserResponse)
	async phoneLoginOrRegister(
		@Ctx() { em, redis, req }: Mycontext,
		@Arg('options') options: PhoneTokenInput,
		@Arg('password', { nullable: true }) password?: string
	): Promise<UserResponse> {
		const { phone, token } = options
		if (!isPhone(phone) || !token) {
			return UserResponse.createError('phone', 'have a mistake!')
		}
		const valiphone = await redis.get(process.env.PHONE_PREFIX + token)
		if (!valiphone || valiphone !== phone) {
			return UserResponse.createError('token', '验证码错误')
		}
		redis.del(process.env.Phone_PREFIX + token)
		const user = await em.findOne(User, { phone })
		if (!user) {
			const salt = await bcrypt.genSalt(10) //做10轮加密
			let newUser: User

			if (password) {
				const hashedPassword = await bcrypt.hash(password, salt)
				newUser = em.create(User, { phone: options.phone, password: hashedPassword })
			} else {
				newUser = em.create(User, { phone: options.phone })
			}
			await em.persistAndFlush(newUser)
			setAuth(req.session, newUser)
			return { user: newUser }
		}
		await em.persistAndFlush(user)
		setAuth(req.session, user)
		return { user }
	}
}
