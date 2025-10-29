import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class Resource {
  @Field(() => ID)
  id: string;

  @Field()
  nameVietnamese: string;

  @Field()
  nameEnglish: string;

  @Field({ nullable: true })
  emoji?: string;

  @Field()
  elementType: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  uses?: any;

  @Field(() => Float)
  baseGenerationRate: number;

  @Field(() => Int)
  baseStorageCapacity: number;

  @Field(() => Int, { nullable: true })
  valuePoints?: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class PlayerResource {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  playerId: string;

  @Field()
  resourceType: string;

  @Field(() => Int)
  amount: number;

  @Field(() => Date, { nullable: true })
  lastHarvestAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
