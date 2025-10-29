import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Province {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  nameEnglish?: string;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Boolean, { nullable: true })
  isCapital?: boolean;

  @Field(() => Float, { nullable: true })
  baseGoldRate?: number;

  @Field(() => Float, { nullable: true })
  baseRiceRate?: number;

  @Field(() => Float, { nullable: true })
  baseWoodRate?: number;

  @Field(() => Float, { nullable: true })
  baseStoneRate?: number;

  @Field(() => Float, { nullable: true })
  baseBazanRate?: number;

  @Field(() => Int, { nullable: true })
  unlockOrder?: number;

  @Field(() => Int, { nullable: true })
  unlockStoryDay?: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class PlayerProvince {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  playerId: string;

  @Field(() => Int)
  provinceId: number;

  @Field(() => Int, { nullable: true })
  farmerLevel?: number;

  @Field(() => Int, { nullable: true })
  resourceLevel?: number;

  @Field(() => Int, { nullable: true })
  developmentLevel?: number;

  @Field(() => Int, { nullable: true })
  buildingsCount?: number;

  @Field(() => ID, { nullable: true })
  heroId?: string;

  @Field(() => Province)
  province: Province;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
