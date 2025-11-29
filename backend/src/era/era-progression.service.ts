import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * EraProgressionService - MVP2 Sprint 4
 * 
 * Historical Era System
 * - Ancient (Cổ Đại): 0-20 stories
 * - Medieval (Trung Đại): 21-50 stories
 * - Modern (Cận Đại): 51-80 stories
 * - Future (Hiện Đại): 81+ stories
 * 
 * Each era unlocks new content and provides bonuses
 */
@Injectable()
export class EraProgressionService {
  constructor(private readonly prisma: PrismaService) {}

  // ========================================
  // ERA CONFIGURATION
  // ========================================

  /**
   * Era definitions with unlock requirements
   */
  private readonly eras = [
    {
      id: 'ancient',
      name: 'Cổ Đại',
      nameEnglish: 'Ancient Era',
      description: 'Thời kỳ dựng nước và giữ nước',
      emoji: '🏛️',
      color: '#8B4513', // Brown
      minStories: 0,
      maxStories: 20,
      benefits: {
        goldBonus: 0,
        riceBonus: 0,
        woodBonus: 0,
        stoneBonus: 0,
        expBonus: 0,
        unlockHeroes: ['ancient'],
      },
      landmarks: [
        'Vương triều Hùng Vương',
        'Thời Bắc thuộc',
        'Nhà Đinh - Tiền Lê',
      ],
    },
    {
      id: 'medieval',
      name: 'Trung Đại',
      nameEnglish: 'Medieval Era',
      description: 'Thời kỳ phát triển và mở rộng',
      emoji: '⚔️',
      color: '#4169E1', // Royal Blue
      minStories: 21,
      maxStories: 50,
      benefits: {
        goldBonus: 10,
        riceBonus: 10,
        woodBonus: 5,
        stoneBonus: 5,
        expBonus: 15,
        unlockHeroes: ['medieval'],
      },
      landmarks: [
        'Nhà Lý - Trần',
        'Chống Mông Cổ',
        'Nhà Hồ - Lê Sơ',
      ],
    },
    {
      id: 'modern',
      name: 'Cận Đại',
      nameEnglish: 'Modern Era',
      description: 'Thời kỳ chống ngoại xâm',
      emoji: '🎖️',
      color: '#DC143C', // Crimson
      minStories: 51,
      maxStories: 80,
      benefits: {
        goldBonus: 25,
        riceBonus: 25,
        woodBonus: 15,
        stoneBonus: 15,
        expBonus: 30,
        unlockHeroes: ['modern'],
      },
      landmarks: [
        'Nhà Nguyễn',
        'Thực dân Pháp',
        'Kháng chiến',
      ],
    },
    {
      id: 'future',
      name: 'Hiện Đại',
      nameEnglish: 'Contemporary Era',
      description: 'Thời kỳ độc lập và phát triển',
      emoji: '🚀',
      color: '#FFD700', // Gold
      minStories: 81,
      maxStories: 999,
      benefits: {
        goldBonus: 50,
        riceBonus: 50,
        woodBonus: 30,
        stoneBonus: 30,
        expBonus: 50,
        unlockHeroes: ['future'],
      },
      landmarks: [
        'Độc lập 1945',
        'Thống nhất 1975',
        'Đổi mới 1986',
      ],
    },
  ];

  // ========================================
  // ERA PROGRESSION
  // ========================================

  /**
   * Get player's current era based on story progress
   */
  async getPlayerCurrentEra(playerId: string) {
    // Count completed stories (via quiz submissions)
    const submissions = await this.prisma.quizSubmission.findMany({
      where: {
        player_id: playerId,
      },
      select: { story_id: true },
      distinct: ['story_id'],
    });
    const completedStories = submissions.length;

    // Determine current era
    const currentEra = this.eras.find(
      (era) => completedStories >= era.minStories && completedStories <= era.maxStories,
    ) || this.eras[0];

    // Calculate progress to next era
    const nextEra = this.eras.find((era) => era.minStories > completedStories);
    const progressToNext = nextEra
      ? {
          nextEra: nextEra.name,
          currentStories: completedStories,
          requiredStories: nextEra.minStories,
          remainingStories: nextEra.minStories - completedStories,
          progressPercentage: Math.min(
            100,
            (completedStories / nextEra.minStories) * 100,
          ),
        }
      : null;

    return {
      playerId,
      currentEra: currentEra.id,
      eraName: currentEra.name,
      eraEmoji: currentEra.emoji,
      completedStories,
      benefits: currentEra.benefits,
      progressToNext,
      isMaxEra: !nextEra,
    };
  }

  /**
   * Get all eras with unlock status
   */
  async getAllErasWithProgress(playerId: string) {
    const submissions = await this.prisma.quizSubmission.findMany({
      where: {
        player_id: playerId,
      },
      select: { story_id: true },
      distinct: ['story_id'],
    });
    const completedStories = submissions.length;

    const erasWithProgress = this.eras.map((era) => {
      const isUnlocked = completedStories >= era.minStories;
      const isCurrent =
        completedStories >= era.minStories && completedStories <= era.maxStories;

      // Calculate progress within era
      let progressPercentage = 0;
      if (isUnlocked) {
        const storiesInEra = Math.min(
          completedStories - era.minStories,
          era.maxStories - era.minStories,
        );
        const totalStoriesInEra = era.maxStories - era.minStories;
        progressPercentage = (storiesInEra / totalStoriesInEra) * 100;
      }

      return {
        id: era.id,
        name: era.name,
        nameEnglish: era.nameEnglish,
        description: era.description,
        emoji: era.emoji,
        color: era.color,
        minStories: era.minStories,
        maxStories: era.maxStories,
        benefits: era.benefits,
        landmarks: era.landmarks,
        isUnlocked,
        isCurrent,
        progressPercentage: Math.min(100, progressPercentage),
        requiredStories: era.minStories,
        remainingStories: Math.max(0, era.minStories - completedStories),
      };
    });

    return {
      playerId,
      completedStories,
      eras: erasWithProgress,
      currentEra: erasWithProgress.find((e) => e.isCurrent),
    };
  }

  /**
   * Calculate total era bonuses for player
   */
  async calculateEraBonuses(playerId: string) {
    const currentEraData = await this.getPlayerCurrentEra(playerId);
    const benefits = currentEraData.benefits;

    return {
      playerId,
      era: currentEraData.currentEra,
      eraName: currentEraData.eraName,
      bonuses: {
        goldProduction: benefits.goldBonus,
        riceProduction: benefits.riceBonus,
        woodProduction: benefits.woodBonus,
        stoneProduction: benefits.stoneBonus,
        experienceGain: benefits.expBonus,
      },
      description: `Thưởng ${currentEraData.eraEmoji} ${currentEraData.eraName}`,
    };
  }

  /**
   * Apply era bonus to production
   */
  applyEraBonus(baseProduction: number, bonusPercentage: number): number {
    return Math.floor(baseProduction * (1 + bonusPercentage / 100));
  }

  /**
   * Check if player can unlock new heroes from current era
   */
  async getUnlockableHeroes(playerId: string) {
    const currentEraData = await this.getPlayerCurrentEra(playerId);
    const unlockedEras = this.eras.filter(
      (era) => era.minStories <= currentEraData.completedStories,
    );

    const unlockableHeroEras = unlockedEras.flatMap((era) => era.benefits.unlockHeroes);

    // Get heroes from database that match unlocked eras
    const heroes = await this.prisma.hero.findMany({
      where: {
        era: {
          in: unlockableHeroEras,
        },
      },
      select: {
        id: true,
        name_vietnamese: true,
        era: true,
        rarity: true,
      },
    });

    return {
      playerId,
      currentEra: currentEraData.currentEra,
      unlockableHeroes: heroes,
      totalUnlocked: heroes.length,
    };
  }

  // ========================================
  // ERA TIMELINE VISUALIZATION DATA
  // ========================================

  /**
   * Get timeline data for frontend visualization
   */
  async getEraTimeline(playerId: string) {
    const erasProgress = await this.getAllErasWithProgress(playerId);

    return {
      playerId,
      completedStories: erasProgress.completedStories,
      timeline: erasProgress.eras.map((era) => ({
        id: era.id,
        name: era.name,
        nameEnglish: era.nameEnglish,
        description: era.description,
        emoji: era.emoji,
        color: era.color,
        minStories: era.minStories,
        maxStories: era.maxStories,
        benefits: era.benefits,
        landmarks: era.landmarks,
        isUnlocked: era.isUnlocked,
        isCurrent: era.isCurrent,
        progressPercentage: era.progressPercentage,
        requiredStories: era.requiredStories,
        remainingStories: era.remainingStories,
      })),
      currentEraIndex: erasProgress.eras.findIndex((e) => e.isCurrent),
    };
  }
}
