import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class GameEvent {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  eventType: string;

  @Field({ nullable: true })
  era?: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class PlayerEventParticipation {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  playerId: string;

  @Field(() => ID)
  eventId: string;

  @Field({ nullable: true })
  choice?: string;

  @Field(() => Int, { nullable: true })
  contributionPoints?: number;

  @Field(() => Boolean, { nullable: true })
  rewardsClaimed?: boolean;

  @Field(() => GameEvent)
  event: GameEvent;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
