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
      id: 'era1_khoinguyenviet',
      name: 'Khởi Nguyên Việt',
      nameEnglish: 'Origin Vietnam Era',
      description: 'Thời kỳ Hùng Vương dựng nước Văn Lang. Công cụ sơ khai, tập trung vào định cư.',
      emoji: '🥁',
      color: 'orange',
      minStories: 0,
      maxStories: 20,
      benefits: {
        goldBonus: 0,
        riceBonus: 5,
        woodBonus: 0,
        stoneBonus: 0,
        expBonus: 0,
        unlockHeroes: ['Khởi Nguyên Việt'],
      },
      landmarks: [
        'Văn Lang',
        'Âu Lạc',
        'Trống Đồng',
      ],
    },
    {
      id: 'era2_thanglong',
      name: 'Thăng Long Hồng Yên',
      nameEnglish: 'Thang Long Era',
      description: 'Thời kỳ đầu tự chủ. Định đô tại Thăng Long, phát triển nông nghiệp lúa nước.',
      emoji: '🐉',
      color: 'amber',
      minStories: 21,
      maxStories: 50,
      benefits: {
        goldBonus: 10,
        riceBonus: 10,
        woodBonus: 5,
        stoneBonus: 5,
        expBonus: 15,
        unlockHeroes: ['Thăng Long Hồng Yên'],
      },
      landmarks: [
        'Thăng Long',
        'Hoa Lư',
        'Kinh thành',
      ],
    },
    {
      id: 'era3_daiviet',
      name: 'Đại Việt',
      nameEnglish: 'Dai Viet Era',
      description: 'Thời kỳ hoàng kim, mở mang bờ cõi về phía Nam. Văn hóa và quân sự phát triển cực thịnh.',
      emoji: '⚔️',
      color: 'blue',
      minStories: 51,
      maxStories: 80,
      benefits: {
        goldBonus: 25,
        riceBonus: 25,
        woodBonus: 15,
        stoneBonus: 15,
        expBonus: 30,
        unlockHeroes: ['Đại Việt'],
      },
      landmarks: [
        'Quốc Tử Giám',
        'Kinh thành Huế',
        'Trấn Biên',
      ],
    },
    {
      id: 'era4_khangchien',
      name: 'Kháng Chiến Tư Tự',
      nameEnglish: 'Resistance Era',
      description: 'Cuộc chiến chống thực dân và giành độc lập. Anh hùng là các chiến sĩ cách mạng.',
      emoji: '🎖️',
      color: 'red',
      minStories: 81,
      maxStories: 110,
      benefits: {
        goldBonus: 40,
        riceBonus: 40,
        woodBonus: 25,
        stoneBonus: 25,
        expBonus: 45,
        unlockHeroes: ['Kháng Chiến Tư Tự'],
      },
      landmarks: [
        'Điện Biên Phủ',
        'Lăng Bác',
        'Dinh Độc Lập',
      ],
    },
    {
      id: 'era5_hiendai',
      name: 'Hiện Đại',
      nameEnglish: 'Modern Era',
      description: 'Thời kỳ xây dựng đất nước đương đại. Công nghiệp hóa, đô thị hóa và hội nhập.',
      emoji: '🚀',
      color: 'purple',
      minStories: 111,
      maxStories: 999,
      benefits: {
        goldBonus: 60,
        riceBonus: 60,
        woodBonus: 30,
        stoneBonus: 30,
        expBonus: 60,
        unlockHeroes: ['Hiện Đại'],
      },
      landmarks: [
        'Landmark 81',
        'Cầu Rồng',
        'Fansipan',
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
