import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class Story {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  day: number;

  @Field()
  titleVietnamese: string;

  @Field()
  titleEnglish: string;

  @Field()
  content: string;

  @Field()
  category: string;

  @Field({ nullable: true })
  era?: string;

  @Field(() => Int, { nullable: true })
  provinceId?: number;

  @Field(() => ID, { nullable: true })
  heroId?: string;

  @Field(() => Int, { nullable: true })
  readingTimeMinutes?: number;

  @Field(() => Int, { nullable: true })
  wordCount?: number;

  @Field(() => Int, { nullable: true })
  baseGoldReward?: number;

  @Field(() => Int, { nullable: true })
  baseRiceReward?: number;

  @Field(() => Int, { nullable: true })
  baseWoodReward?: number;

  @Field(() => Boolean, { nullable: true })
  isPremium?: boolean;

  @Field(() => Boolean, { nullable: true })
  isAvailable?: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class QuizQuestion {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  storyId: string;

  @Field(() => Int)
  questionNumber: number;

  @Field()
  question: string;

  @Field(() => GraphQLJSON)
  options: any;

  @Field(() => Int)
  correctAnswer: number;

  @Field({ nullable: true })
  difficulty?: string;

  @Field({ nullable: true })
  type?: string;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class QuizSubmission {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  playerId: string;

  @Field(() => ID)
  storyId: string;

  @Field(() => Int)
  score: number;

  @Field(() => Int)
  maxScore: number;

  @Field(() => GraphQLJSON, { nullable: true })
  answers?: any;

  @Field(() => Int, { nullable: true })
  timeTaken?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  rewards?: any;

  @Field(() => Date)
  submittedAt: Date;

  // MVP2: Quiz x5 multiplier fields
  @Field(() => Number, { nullable: true })
  multiplier?: number;

  @Field(() => Boolean, { nullable: true })
  isPerfect?: boolean;

  @Field(() => Int, { nullable: true })
  correctCount?: number;

  @Field(() => Int, { nullable: true })
  totalQuestions?: number;

  @Field(() => Int, { nullable: true })
  perfectStreak?: number;
}

// MVP2: Story with unlock status
@ObjectType()
export class StoryWithUnlockStatus extends Story {
  @Field(() => Boolean)
  isUnlocked: boolean;

  @Field(() => Int)
  daysUntilUnlock: number;

  @Field(() => Boolean)
  isCompleted: boolean;

  @Field(() => Int)
  daysSinceRegistration: number;
}
