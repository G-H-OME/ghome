import { Entity, PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core'
import { ObjectId } from '@mikro-orm/mongodb'
import { Field, InterfaceType } from 'type-graphql'

@InterfaceType()
@Entity({ abstract: true }) //可选
export abstract class MongoClass {
	@PrimaryKey()
	readonly _id!: ObjectId

	@Field()
	@SerializedPrimaryKey()
	id!: string

	@Field(() => String)
	@Property({ type: 'date' })
	createdAt = new Date()

	@Field(() => String)
	@Property({ type: 'date', onUpdate: () => new Date() })
	updatedAt = new Date()
}
