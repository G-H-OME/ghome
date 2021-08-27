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
import { setAuth } from '../utls/setAuth'

@InputType()
class PhonePasswordInput {
	@Field()
	phone: string
	@Field()
	password: string
}

// @InputType()
// class PhoneTokenInput {
// 	@Field()
// 	phone: string
// 	@Field()
// 	token: string
// }

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
		if (password != user.password) {
			return UserResponse.createError('phone', '密码mistake')
		}
		setAuth(req.session, user)
		return { user }
	}
}
