import { InputType, Field, Int } from '@nestjs/graphql';
import { StringFilter, IntFilter, BooleanFilter } from '../common/filters.input';

@InputType()
export class HeroWhereInput {
  @Field(() => StringFilter, { nullable: true })
  id?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  nameVietnamese?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  era?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  rarity?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  role?: StringFilter;

  @Field(() => BooleanFilter, { nullable: true })
  isAvailable?: BooleanFilter;

  @Field(() => BooleanFilter, { nullable: true })
  isPremium?: BooleanFilter;

  @Field(() => IntFilter, { nullable: true })
  storyDay?: IntFilter;
}

@InputType()
export class PlayerHeroWhereInput {
  @Field(() => StringFilter, { nullable: true })
  playerId?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  heroId?: StringFilter;

  @Field(() => IntFilter, { nullable: true })
  level?: IntFilter;

  @Field(() => IntFilter, { nullable: true })
  deployedTo?: IntFilter;
}

@InputType()
export class RecruitHeroInput {
  @Field()
  heroId: string;
}

@InputType()
export class DeployHeroInput {
  @Field()
  heroId: string;

  @Field(() => Int)
  provinceId: number;
}

@InputType()
export class LevelUpHeroInput {
  @Field()
  playerHeroId: string;
}
