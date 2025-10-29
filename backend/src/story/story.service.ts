import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StoryWhereInput, SubmitQuizInput, MarkStoryReadInput } from '../graphql/inputs/story.input';

@Injectable()
export class StoryService {
  constructor(private prisma: PrismaService) {}

  // Get all stories
  async findAll(where?: StoryWhereInput, skip?: number, take?: number) {
    const whereClause = this.buildStoryWhereClause(where);

    const [stories, total] = await Promise.all([
      this.prisma.story.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { day: 'asc' },
      }),
      this.prisma.story.count({ where: whereClause }),
    ]);

    return { stories, total };
  }

  // Get story by ID
  async findById(id: string) {
    const story = await this.prisma.story.findUnique({
      where: { id },
      include: {
        quiz_questions: {
          orderBy: { question_number: 'asc' },
        },
      },
    });

    if (!story) {
      throw new NotFoundException(`Story with ID ${id} not found`);
    }

    return story;
  }

  // Get story by day
  async findByDay(day: number) {
    const story = await this.prisma.story.findFirst({
      where: { day },
      include: {
        quiz_questions: {
          orderBy: { question_number: 'asc' },
        },
      },
    });

    if (!story) {
      throw new NotFoundException(`Story for day ${day} not found`);
    }

    return story;
  }

  // Mark story as read
  async markStoryRead(playerId: string, input: MarkStoryReadInput) {
    const story = await this.findById(input.storyId);

    // Check if already read today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.dailyQuestProgress.findFirst({
      where: {
        player_id: playerId,
        story_id: input.storyId,
        quest_date: today,
      },
    });

    if (existing) {
      return existing;
    }

    // Create new progress entry
    const progress = await this.prisma.dailyQuestProgress.create({
      data: {
        player_id: playerId,
        story_id: input.storyId,
        quest_date: today,
        story_read: true,
        quiz_attempted: false,
        quiz_score: 0,
        gold_earned: 0,
        rice_earned: 0,
        wood_earned: 0,
      },
    });

    return progress;
  }

  // Submit quiz
  async submitQuiz(playerId: string, input: SubmitQuizInput) {
    const story = await this.findById(input.storyId);

    // Get quiz questions
    const questions = await this.prisma.quizQuestion.findMany({
      where: { story_id: input.storyId },
      orderBy: { question_number: 'asc' },
    });

    if (questions.length === 0) {
      throw new BadRequestException('No quiz questions found for this story');
    }

    // Calculate score
    let correctAnswers = 0;
    const answersMap = new Map(input.answers.map(a => [a.questionNumber, a.selectedAnswer]));

    for (const question of questions) {
      const playerAnswer = answersMap.get(question.question_number);
      if (playerAnswer === question.correct_answer) {
        correctAnswers++;
      }
    }

    const score = correctAnswers;
    const maxScore = questions.length;
    const percentage = (score / maxScore) * 100;

    // Calculate rewards (higher score = more rewards)
    const rewardMultiplier = percentage >= 100 ? 1.5 : percentage >= 66 ? 1.2 : percentage >= 33 ? 1 : 0.5;
    
    const goldReward = Math.floor((story.base_gold_reward || 100) * rewardMultiplier);
    const riceReward = Math.floor((story.base_rice_reward || 100) * rewardMultiplier);
    const woodReward = Math.floor((story.base_wood_reward || 50) * rewardMultiplier);

    // Create quiz submission
    const submission = await this.prisma.quizSubmission.create({
      data: {
        player_id: playerId,
        story_id: input.storyId,
        score,
        max_score: maxScore,
        answers: input.answers as any,
        time_taken: input.timeTaken,
        rewards: {
          gold: goldReward,
          rice: riceReward,
          wood: woodReward,
        } as any,
        submitted_at: new Date(),
      },
    });

    // Update daily quest progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.dailyQuestProgress.upsert({
      where: {
        player_id_quest_date_story_id: {
          player_id: playerId,
          quest_date: today,
          story_id: input.storyId,
        },
      },
      create: {
        player_id: playerId,
        story_id: input.storyId,
        quest_date: today,
        story_read: true,
        quiz_attempted: true,
        quiz_score: score,
        gold_earned: goldReward,
        rice_earned: riceReward,
        wood_earned: woodReward,
      },
      update: {
        quiz_attempted: true,
        quiz_score: score,
        gold_earned: goldReward,
        rice_earned: riceReward,
        wood_earned: woodReward,
      },
    });

    // Give rewards to player
    await this.giveRewards(playerId, {
      gold: goldReward,
      rice: riceReward,
      wood: woodReward,
    });

    // Update player stats
    await this.updatePlayerStats(playerId, score === maxScore);

    return submission;
  }

  // Get player quiz submissions
  async getPlayerSubmissions(playerId: string) {
    return this.prisma.quizSubmission.findMany({
      where: { player_id: playerId },
      orderBy: { submitted_at: 'desc' },
      take: 50,
    });
  }

  // Helper: Build story where clause
  private buildStoryWhereClause(where?: StoryWhereInput) {
    if (!where) return { is_available: true };

    const clause: any = { is_available: true };

    if (where.day) {
      if (where.day.equals !== undefined) clause.day = where.day.equals;
      if (where.day.lte !== undefined) clause.day = { lte: where.day.lte };
      if (where.day.gte !== undefined) {
        clause.day = { ...clause.day, gte: where.day.gte };
      }
    }

    if (where.category) {
      if (where.category.equals) clause.category = where.category.equals;
    }

    if (where.era) {
      if (where.era.equals) clause.era = where.era.equals;
    }

    if (where.provinceId) {
      if (where.provinceId.equals !== undefined) clause.province_id = where.provinceId.equals;
    }

    if (where.isPremium) {
      if (where.isPremium.equals !== undefined) clause.is_premium = where.isPremium.equals;
    }

    return clause;
  }

  // Helper: Give rewards to player
  private async giveRewards(playerId: string, rewards: any) {
    const resourceTypes = ['gold', 'rice', 'wood'];

    for (const resourceType of resourceTypes) {
      if (rewards[resourceType] > 0) {
        await this.prisma.playerResource.upsert({
          where: {
            player_id_resource_type: {
              player_id: playerId,
              resource_type: resourceType,
            },
          },
          create: {
            player_id: playerId,
            resource_type: resourceType,
            amount: rewards[resourceType],
          },
          update: {
            amount: { increment: rewards[resourceType] },
          },
        });
      }
    }
  }

  // Helper: Update player stats
  private async updatePlayerStats(playerId: string, isPerfect: boolean) {
    await this.prisma.playerStats.upsert({
      where: { player_id: playerId },
      create: {
        player_id: playerId,
        stories_read: 1,
        stories_completed: 1,
        quizzes_taken: 1,
        quizzes_passed: isPerfect ? 1 : 0,
        perfect_quizzes: isPerfect ? 1 : 0,
      },
      update: {
        stories_read: { increment: 1 },
        stories_completed: { increment: 1 },
        quizzes_taken: { increment: 1 },
        quizzes_passed: { increment: isPerfect ? 1 : 0 },
        perfect_quizzes: { increment: isPerfect ? 1 : 0 },
        last_story_read_at: new Date(),
      },
    });
  }
}
