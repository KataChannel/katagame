import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { StoryService } from './story.service';
import { Story, QuizQuestion, QuizSubmission, StoryWithUnlockStatus } from '../graphql/models/story.model';
import { StoryWhereInput, SubmitQuizInput, MarkStoryReadInput } from '../graphql/inputs/story.input';
import { PaginationInput } from '../graphql/common/filters.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Story)
export class StoryResolver {
  constructor(private storyService: StoryService) {}

  // Transform helpers
  private transformStory(story: any): Story {
    return {
      ...story,
      titleVietnamese: story.title_vietnamese,
      titleEnglish: story.title_english,
      era: story.era ?? undefined,
      provinceId: story.province_id ?? undefined,
      heroId: story.hero_id ?? undefined,
      readingTimeMinutes: story.reading_time_minutes ?? undefined,
      wordCount: story.word_count ?? undefined,
      baseGoldReward: story.base_gold_reward ?? undefined,
      baseRiceReward: story.base_rice_reward ?? undefined,
      baseWoodReward: story.base_wood_reward ?? undefined,
      isPremium: story.is_premium ?? undefined,
      isAvailable: story.is_available ?? undefined,
      createdAt: story.created_at ?? new Date(),
      updatedAt: story.updated_at ?? new Date(),
    };
  }

  private transformQuizQuestion(q: any): QuizQuestion {
    return {
      ...q,
      storyId: q.story_id,
      questionNumber: q.question_number,
      correctAnswer: q.correct_answer,
      difficulty: q.difficulty ?? undefined,
      type: q.type ?? undefined,
      createdAt: q.created_at ?? new Date(),
    };
  }

  private transformQuizSubmission(s: any): QuizSubmission {
    return {
      ...s,
      playerId: s.player_id,
      storyId: s.story_id,
      maxScore: s.max_score,
      timeTaken: s.time_taken ?? undefined,
      submittedAt: s.submitted_at ?? new Date(),
      multiplier: s.multiplier ? parseFloat(s.multiplier.toString()) : undefined,
      isPerfect: s.isPerfect ?? undefined,
      correctCount: s.correctCount ?? undefined,
      totalQuestions: s.totalQuestions ?? undefined,
      perfectStreak: s.perfectStreak ?? undefined,
    };
  }

  private transformStoryWithUnlock(s: any): StoryWithUnlockStatus {
    return {
      ...this.transformStory(s),
      isUnlocked: s.isUnlocked,
      daysUntilUnlock: s.daysUntilUnlock,
      isCompleted: s.isCompleted,
      daysSinceRegistration: s.daysSinceRegistration,
    };
  }

  // Get all stories (public)
  @Query(() => [Story])
  async stories(
    @Args('where', { nullable: true }) where?: StoryWhereInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<Story[]> {
    const { stories } = await this.storyService.findAll(where, pagination?.skip, pagination?.take);
    return stories.map(s => this.transformStory(s));
  }

  // Get story by ID (public)
  @Query(() => Story)
  async story(@Args('id') id: string): Promise<Story> {
    const story = await this.storyService.findById(id);
    return this.transformStory(story);
  }

  // Get story by day (public)
  @Query(() => Story)
  async storyByDay(@Args('day', { type: () => Int }) day: number): Promise<Story> {
    const story = await this.storyService.findByDay(day);
    return this.transformStory(story);
  }

  // Get quiz questions for a story (public)
  @Query(() => [QuizQuestion])
  async quizQuestions(@Args('storyId') storyId: string): Promise<QuizQuestion[]> {
    const story = await this.storyService.findById(storyId);
    return (story.quiz_questions || []).map(q => this.transformQuizQuestion(q));
  }

  // MVP2: Get stories with daily unlock status (authenticated)
  @Query(() => [StoryWithUnlockStatus])
  @UseGuards(JwtAuthGuard)
  async availableStories(@CurrentUser() user: any): Promise<StoryWithUnlockStatus[]> {
    const stories = await this.storyService.getAvailableStories(user.id);
    return stories.map(s => this.transformStoryWithUnlock(s));
  }

  // Mark story as read (authenticated)
  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async markStoryRead(
    @CurrentUser() user: any,
    @Args('input') input: MarkStoryReadInput,
  ): Promise<string> {
    await this.storyService.markStoryRead(user.id, input);
    return 'Story marked as read';
  }

  // Submit quiz (authenticated)
  @Mutation(() => QuizSubmission)
  @UseGuards(JwtAuthGuard)
  async submitQuiz(
    @CurrentUser() user: any,
    @Args('input') input: SubmitQuizInput,
  ): Promise<QuizSubmission> {
    const submission = await this.storyService.submitQuiz(user.id, input);
    return this.transformQuizSubmission(submission);
  }

  // Get player quiz submissions (authenticated)
  @Query(() => [QuizSubmission])
  @UseGuards(JwtAuthGuard)
  async myQuizSubmissions(@CurrentUser() user: any): Promise<QuizSubmission[]> {
    const submissions = await this.storyService.getPlayerSubmissions(user.id);
    return submissions.map(s => this.transformQuizSubmission(s));
  }
}
