import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Item {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  nameVietnamese: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String)
  itemType: string;

  @Field(() => String)
  rarity: string;

  @Field(() => Int, { nullable: true })
  staminaRestore?: number;

  @Field(() => Int, { nullable: true })
  luckBonus?: number;

  @Field(() => Int, { nullable: true })
  baseBronzeCost?: number;

  @Field(() => Int, { nullable: true })
  baseRiceCost?: number;

  @Field(() => Int, { nullable: true })
  baseWoodCost?: number;

  @Field(() => Boolean)
  isCraftable: boolean;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class PlayerItem {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  playerId: string;

  @Field(() => String)
  itemId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Item)
  item: Item;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
