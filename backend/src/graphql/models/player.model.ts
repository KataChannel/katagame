import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class Player {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field(() => Int, { nullable: true })
  level?: number;

  @Field(() => Int, { nullable: true })
  experience?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  resources?: any;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  region?: string;

  @Field(() => Boolean, { nullable: true })
  premiumPassActive?: boolean;

  @Field(() => Date, { nullable: true })
  premiumExpiresAt?: Date;

  @Field(() => Date, { nullable: true })
  lastLogin?: Date;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
