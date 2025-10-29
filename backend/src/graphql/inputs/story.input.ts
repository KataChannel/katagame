import { InputType, Field, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { StringFilter, IntFilter, BooleanFilter } from '../common/filters.input';

@InputType()
export class StoryWhereInput {
  @Field(() => IntFilter, { nullable: true })
  day?: IntFilter;

  @Field(() => StringFilter, { nullable: true })
  category?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  era?: StringFilter;

  @Field(() => IntFilter, { nullable: true })
  provinceId?: IntFilter;

  @Field(() => BooleanFilter, { nullable: true })
  isAvailable?: BooleanFilter;

  @Field(() => BooleanFilter, { nullable: true })
  isPremium?: BooleanFilter;
}

@InputType()
export class QuizAnswerInput {
  @Field(() => Int)
  questionNumber: number;

  @Field(() => Int)
  selectedAnswer: number;
}

@InputType()
export class SubmitQuizInput {
  @Field()
  storyId: string;

  @Field(() => [QuizAnswerInput])
  answers: QuizAnswerInput[];

  @Field(() => Int, { nullable: true })
  timeTaken?: number;
}

@InputType()
export class MarkStoryReadInput {
  @Field()
  storyId: string;
}
