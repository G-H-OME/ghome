import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { MongoClass } from './MongoClass'
import { User } from './User'
@ObjectType({ implements: MongoClass })
@Entity()
export class Post extends MongoClass {
	@Field()
	@Property()
	title!: string

	@Field(() => User)
	@ManyToOne(() => User)
	creator!: User
}
