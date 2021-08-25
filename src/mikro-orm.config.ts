import {
	Connection,
	EntityManager,
	IDatabaseDriver,
	MikroORM,
} from '@mikro-orm/core'
import { MongoHighlighter } from '@mikro-orm/mongo-highlighter'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import dotenv from 'dotenv'
import path from 'path'
import { Post } from './entities/Post'
dotenv.config({ path: path.join(__dirname, '..', '.env') })
export type Mycontext = {
	em: EntityManager<IDatabaseDriver<Connection>>
}

export default {
	metadataProvider: TsMorphMetadataProvider,
	type: 'mongo',
	clientUrl: process.env.MONGODB,
	entities: [Post],
	highlighter: new MongoHighlighter(),
	debug: process.env.NODE_ENV === 'development',
} as Parameters<typeof MikroORM.init>[0]
