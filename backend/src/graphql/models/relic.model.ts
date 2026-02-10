import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Relic {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  era: string;

  @Field(() => String)
  rarity: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String)
  auraType: string;

  @Field(() => Float)
  auraValue: number;

  @Field(() => Int)
  auraRadius: number;

  @Field(() => Int, { nullable: true })
  baseBronzeCost?: number | null;

  @Field(() => Int, { nullable: true })
  baseBazanCost?: number | null;
}

@ObjectType()
export class PlayerRelic {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  playerId: string;

  @Field(() => ID)
  relicId: string;

  @Field(() => Int, { nullable: true })
  provinceId?: number | null;

  @Field(() => Date, { nullable: true })
  placedAt?: Date | null;

  @Field(() => Relic)
  relic: Relic;
}
