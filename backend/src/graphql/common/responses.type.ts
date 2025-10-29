import { ObjectType, Field, Int } from '@nestjs/graphql';

/**
 * Generic Response Types
 */

@ObjectType()
export class MutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}

@ObjectType()
export class AuthResponse extends MutationResponse {
  @Field({ nullable: true })
  token?: string;

  @Field({ nullable: true })
  playerId?: string;

  @Field({ nullable: true })
  username?: string;

  @Field(() => Int, { nullable: true })
  level?: number;
}

/**
 * Pagination Info
 */
@ObjectType()
export class PageInfo {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;

  @Field()
  hasMore: boolean;
}
