import { Entity, Property } from '@mikro-orm/core'
import { Field, InputType, ObjectType } from 'type-graphql'
import { MongoClass } from './MongoClass'

@InputType()
export class adminProductInput {
	@Field()
	productName: string

	@Field()
	price: number
}

@ObjectType({ implements: MongoClass })
@Entity()
export class Product extends MongoClass {
	@Field()
	@Property({ type: 'text' })
	productName!: string

	@Field()
	@Property()
	price!: number
}
