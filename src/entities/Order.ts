import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { MongoClass } from './MongoClass'
import { User } from './User'

@ObjectType({ implements: MongoClass })
@Entity()
export class Order extends MongoClass {
	@Field(() => User)
	@ManyToOne(() => User)
	user!: User

	@Field(() => Number)
	@Property({ type: 'number' })
	amount!: number

	@Field(() => Boolean)
	@Property({ type: 'boolean' })
	payed: boolean = false

	@Field(() => String)
	@Property({ type: 'date', nullable: true })
	paytime?: Date
}
