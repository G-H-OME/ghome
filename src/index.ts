import { MikroORM } from '@mikro-orm/core'
import { ApolloServer } from 'apollo-server-express'
import connectRedis from 'connect-redis'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import Redis from 'ioredis'
import path from 'path'
import { buildSchema } from 'type-graphql'
import mikroConfig from './mikro-orm.config'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const main = async () => {
	const orm = await MikroORM.init(mikroConfig)
	const app = express()
	const RedisStore = connectRedis(session)
	const options: Redis.RedisOptions = {
		host: process.env.REDIS_URL,
		password: process.env.REDIS_PASSWORD,
		retryStrategy: (times) => Math.max(times * 100, 3000),
	}
	const redis = new Redis(process.env.REDIS_URL, options)
	const pubSub = new RedisPubSub({})
	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
			pubSub,
		}),
		context: ({ req, res }) => ({
			em: orm.em,
			req,
			res,
			redis,
		}),
	})
	app.set('trust proxy', 1)
	app.use(
		cors({
			origin: process.env.FRONTEND_URL,
			credentials: true,
		})
	)
	// const post = orm.em.create(Post, { title: '666', creator:''})
	// await orm.em.persistAndFlush(post)
	// app.get('/', (req: Request, res: Response) => {
	// 	res.send('Hello World')
	// })

	app.use(
		session({
			name: process.env.COOKIE_NAME,
			store: new RedisStore({ client: redis, disableTouch: true }),
			cookie: {
				maxAge: 1000 * 60 * 60 * parseInt(process.env.COOKIE_MAXAGE_HOURS),
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
			},
			secret: process.env.REDIS_SECRET,
			saveUninitialized: false,
			resave: false,
		})
	)

	apolloServer.applyMiddleware({ app, cors: false })
	app.listen(process.env.PORT)
}

main()
