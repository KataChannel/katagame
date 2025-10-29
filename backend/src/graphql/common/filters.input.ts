import { Field, InputType, Int } from '@nestjs/graphql';

/**
 * Base Input Types for Unified GraphQL API (Prisma-like syntax)
 */

@InputType()
export class StringFilter {
  @Field({ nullable: true })
  equals?: string;

  @Field(() => [String], { nullable: true })
  in?: string[];

  @Field(() => [String], { nullable: true })
  notIn?: string[];

  @Field({ nullable: true })
  lt?: string;

  @Field({ nullable: true })
  lte?: string;

  @Field({ nullable: true })
  gt?: string;

  @Field({ nullable: true })
  gte?: string;

  @Field({ nullable: true })
  contains?: string;

  @Field({ nullable: true })
  startsWith?: string;

  @Field({ nullable: true })
  endsWith?: string;
}

@InputType()
export class IntFilter {
  @Field(() => Int, { nullable: true })
  equals?: number;

  @Field(() => [Int], { nullable: true })
  in?: number[];

  @Field(() => [Int], { nullable: true })
  notIn?: number[];

  @Field(() => Int, { nullable: true })
  lt?: number;

  @Field(() => Int, { nullable: true })
  lte?: number;

  @Field(() => Int, { nullable: true })
  gt?: number;

  @Field(() => Int, { nullable: true })
  gte?: number;
}

@InputType()
export class BooleanFilter {
  @Field({ nullable: true })
  equals?: boolean;
}

@InputType()
export class DateTimeFilter {
  @Field({ nullable: true })
  equals?: Date;

  @Field(() => [Date], { nullable: true })
  in?: Date[];

  @Field(() => [Date], { nullable: true })
  notIn?: Date[];

  @Field({ nullable: true })
  lt?: Date;

  @Field({ nullable: true })
  lte?: Date;

  @Field({ nullable: true })
  gt?: Date;

  @Field({ nullable: true })
  gte?: Date;
}

@InputType()
export class OrderByInput {
  @Field({ nullable: true })
  asc?: string;

  @Field({ nullable: true })
  desc?: string;
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  skip?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  take?: number;
}

/**
 * Unified Query Response
 */
export interface UnifiedQueryResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}
