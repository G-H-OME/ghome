import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Post } from '../entities/Post'
import { Mycontext } from '../mikro-orm.config'

@Resolver(Post)
export class PostResolver {
	@Query(() => [Post])
	posts(@Ctx() { em }: Mycontext): Promise<Post[]> {
		return em.find(Post, {})
	}

	@Query(() => Post, { nullable: true })
	post(
		@Ctx() { em }: Mycontext,
		@Arg('id', () => String) id: string
	): Promise<Post | null> {
		return em.findOne(Post, { id })
	}

	@Mutation(() => Post, { nullable: true })
	async createPost(
		@Ctx() { em }: Mycontext,
		@Arg('title', () => String) title: string
	): Promise<Post> {
		const post = em.create(Post, { title })
		await em.persistAndFlush(post)
		return post
	}
}
