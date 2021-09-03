import {
	Arg,
	Ctx,
	FieldResolver,
	Mutation,
	Query,
	Resolver,
	Root,
	UseMiddleware,
} from 'type-graphql'
import { Post } from '../entities/Post'
import { User } from '../entities/User'
import { isAuth } from '../middleware/isAuth'
import { Mycontext } from '../mikro-orm.config'

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => User)
	async creator(@Root() post: Post, @Ctx() { em }: Mycontext) {
		const user = await em.findOne(User, { id: post.creator.id })
		return user
	}

	@Query(() => [Post])
	posts(@Ctx() { em }: Mycontext): Promise<Post[]> {
		return em.find(Post, {})
	}

	@Query(() => [Post])
	myPosts(@Ctx() { req, em }: Mycontext): Promise<Post[]> {
		return em.find(Post, { creator: req.session.userId })
	}

	@Query(() => Post, { nullable: true })
	post(
		@Ctx() { em }: Mycontext,
		@Arg('id', () => String) id: string
	): Promise<Post | null> {
		return em.findOne(Post, { id })
	}

	@Mutation(() => Post, { nullable: true })
	@UseMiddleware(isAuth())
	async createPost(
		@Ctx() { em, req }: Mycontext,
		@Arg('title', () => String) title: string
	): Promise<Post> {
		const post = em.create(Post, { title, creator: req.session.userId })
		await em.persistAndFlush(post)
		return post
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth())
	async deletePost(
		@Ctx() { em }: Mycontext,
		@Arg('id') id: string
	): Promise<Boolean> {
		await em.nativeDelete(Post, { id })
		return true
	}

	@UseMiddleware(isAuth())
	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Ctx() { em }: Mycontext,
		@Arg('id') id: string,
		@Arg('title', () => String, { nullable: true }) title: string
	): Promise<Post | null> {
		const post = await em.findOne(Post, { id })
		if (!post) {
			return null
		}
		post.title = title
		await em.persistAndFlush(post)
		return post
	}
}
