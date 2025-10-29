import { InputType, Field, Int } from '@nestjs/graphql';
import { StringFilter, IntFilter, BooleanFilter } from '../common/filters.input';

@InputType()
export class ProvinceWhereInput {
  @Field(() => IntFilter, { nullable: true })
  id?: IntFilter;

  @Field(() => StringFilter, { nullable: true })
  name?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  region?: StringFilter;

  @Field(() => BooleanFilter, { nullable: true })
  is_capital?: BooleanFilter;

  @Field(() => IntFilter, { nullable: true })
  unlock_order?: IntFilter;

  @Field(() => IntFilter, { nullable: true })
  unlock_story_day?: IntFilter;
}

@InputType()
export class PlayerProvinceWhereInput {
  @Field(() => StringFilter, { nullable: true })
  player_id?: StringFilter;

  @Field(() => IntFilter, { nullable: true })
  province_id?: IntFilter;

  @Field(() => IntFilter, { nullable: true })
  farmer_level?: IntFilter;

  @Field(() => IntFilter, { nullable: true })
  resource_level?: IntFilter;

  @Field(() => IntFilter, { nullable: true })
  development_level?: IntFilter;
}

@InputType()
export class UnlockProvinceInput {
  @Field(() => Int)
  provinceId: number;

  @Field({ nullable: true })
  heroId?: string;
}

@InputType()
export class UpgradeProvinceInput {
  @Field(() => Int)
  provinceId: number;

  @Field()
  upgradeType: string; // 'farmer' | 'resource' | 'development'
}
