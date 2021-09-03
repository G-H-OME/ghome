import { PubSubEngine } from 'graphql-subscriptions'
import {
	Arg,
	Ctx,
	Field,
	Mutation,
	PubSub,
	Resolver,
	Root,
	Subscription,
	UseMiddleware,
} from 'type-graphql'
import { PAYMENTNOTICE, PAYMENTSUCCESS } from '../const/topics'
import { Order } from '../entities/Order'
import { isAuth } from '../middleware/isAuth'
import { Mycontext } from '../mikro-orm.config'

class PayResponse {
	@Field()
	outTradeNo?: string

	@Field()
	qrCode?: string

	@Field(() => String)
	msg: 'Success' | 'Business Failed'
}

@Resolver()
export class PaymentResolver {
	@UseMiddleware(isAuth())
	@Mutation(() => PayResponse)
	async alipay(
		@Arg('amount') amount: number,
		@Ctx() { em, req }: Mycontext,
		@PubSub() pubSub: PubSubEngine
	) {
		const order = em.create(Order, { amount, user: req.session.userId })
		if (amount <= 0) {
		}
		await em.persistAndFlush(order)
		// const result = await payAlipay(order.id, `充值${amount}元`, amount)
		const result = `${order.id}充值${amount}元`
		//console.log(result)
		pubSub.publish(PAYMENTNOTICE, result)
		return result
	}

	@Subscription(() => PayResponse, {
		topics: PAYMENTNOTICE,
	})
	paymentNotice(@Root() opt: PayResponse) {
		const { msg, outTradeNo, qrCode } = opt
		return { msg, outTradeNo, qrCode }
	}

	@Subscription({
		topics: PAYMENTSUCCESS,
	})
	paymentSuccess(@Root() success: boolean): boolean {
		return success
	}
}
