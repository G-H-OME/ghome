import { MikroORM } from '@mikro-orm/core'
import { ApolloServer } from 'apollo-server-express'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import { buildSchema } from 'type-graphql'
import mikroConfig from './mikro-orm.config'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const main = async () => {
	const orm = await MikroORM.init(mikroConfig)
	const app = express()
	app.use(cors())
	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver],
			validate: false,
		}),
		context: ({ req, res }) => ({
			em: orm.em,
			req,
			res,
		}),
	})
	// const post = orm.em.create(Post, { title: '666' })
	// await orm.em.persistAndFlush(post)
	// app.get('/', (req: Request, res: Response) => {
	// 	res.send('Hello World')
	// })
	apolloServer.applyMiddleware({ app, cors: false })

	app.listen(process.env.PORT)
}

main()
