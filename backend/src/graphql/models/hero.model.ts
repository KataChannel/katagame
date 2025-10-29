import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Hero {
  @Field(() => ID)
  id: string;

  @Field()
  nameVietnamese: string;

  @Field({ nullable: true })
  nameEnglish?: string;

  @Field({ nullable: true })
  era?: string;

  @Field({ nullable: true })
  rarity?: string;

  @Field({ nullable: true })
  role?: string;

  @Field(() => Int, { nullable: true })
  baseHp?: number;

  @Field(() => Int, { nullable: true })
  baseAttack?: number;

  @Field(() => Int, { nullable: true })
  baseDefense?: number;

  @Field(() => Int, { nullable: true })
  baseSpeed?: number;

  @Field({ nullable: true })
  bonusType?: string;

  @Field(() => Int, { nullable: true })
  bonusValue?: number;

  @Field({ nullable: true })
  petName?: string;

  @Field({ nullable: true })
  petEmoji?: string;

  @Field(() => Int, { nullable: true })
  petBonus?: number;

  @Field(() => Int, { nullable: true })
  storyDay?: number;

  @Field({ nullable: true })
  unlockRequirement?: string;

  @Field(() => Boolean, { nullable: true })
  isAvailable?: boolean;

  @Field(() => Boolean, { nullable: true })
  isPremium?: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class PlayerHero {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  playerId: string;

  @Field(() => ID)
  heroId: string;

  @Field(() => Int, { nullable: true })
  level?: number;

  @Field(() => Int, { nullable: true })
  experience?: number;

  @Field(() => Int, { nullable: true })
  deployedTo?: number;

  @Field(() => Hero)
  hero: Hero;

  @Field(() => Date)
  acquiredAt: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
