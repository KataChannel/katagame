import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Relic {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  era: string;

  @Field()
  rarity: string;

  @Field({ nullable: true })
  description?: string | null;

  @Field()
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

  @Field({ nullable: true })
  placedAt?: Date | null;

  @Field(() => Relic)
  relic: Relic;
}
