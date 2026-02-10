import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class GameEvent {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String)
  eventType: string;

  @Field(() => String, { nullable: true })
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

  @Field(() => String, { nullable: true })
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
