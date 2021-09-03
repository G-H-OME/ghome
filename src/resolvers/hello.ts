import {
	PubSub,
	PubSubEngine,
	Query,
	Resolver,
	Root,
	Subscription,
} from 'type-graphql'
import { HELLOSUCCESS } from '../const/topics'

@Resolver()
export class HelloResolver {
	@Query(() => String)
	hello(@PubSub() pubSub: PubSubEngine) {
		pubSub.publish(HELLOSUCCESS, 'hello')
		return 'hello'
	}

	@Subscription(() => String, {
		topics: HELLOSUCCESS,
	})
	testSub(@Root() root) {
		console.log(root)
		return true
	}
}
