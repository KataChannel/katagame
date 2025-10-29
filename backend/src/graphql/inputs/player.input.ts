import { InputType, Field } from '@nestjs/graphql';
import { StringFilter, IntFilter, BooleanFilter } from '../common/filters.input';

@InputType()
export class PlayerWhereInput {
  @Field(() => StringFilter, { nullable: true })
  id?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  username?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  email?: StringFilter;

  @Field(() => IntFilter, { nullable: true })
  level?: IntFilter;

  @Field(() => StringFilter, { nullable: true })
  status?: StringFilter;

  @Field(() => BooleanFilter, { nullable: true })
  premiumPassActive?: BooleanFilter;
}

@InputType()
export class PlayerUpdateInput {
  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  level?: number;

  @Field({ nullable: true })
  experience?: number;
}
