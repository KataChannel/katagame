import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HeroWhereInput, PlayerHeroWhereInput, RecruitHeroInput, DeployHeroInput, LevelUpHeroInput } from '../graphql/inputs/hero.input';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class HeroService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // Get all heroes
  async findAll(where?: HeroWhereInput, skip?: number, take?: number) {
    const cacheKey = `heroes:all:${JSON.stringify(where)}:${skip}:${take}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const whereClause = this.buildHeroWhereClause(where);

    const [heroes, total] = await Promise.all([
      this.prisma.hero.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.hero.count({ where: whereClause }),
    ]);

    const result = { heroes, total };
    await this.redis.set(cacheKey, JSON.stringify(result), 3600); // 1 hour
    return result;
  }

  // Get hero by ID
  async findById(id: string) {
    const cacheKey = `hero:id:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const hero = await this.prisma.hero.findUnique({
      where: { id },
    });

    if (!hero) {
      throw new NotFoundException(`Hero with ID ${id} not found`);
    }

    await this.redis.set(cacheKey, JSON.stringify(hero), 3600); // 1 hour
    return hero;
  }

  // Get player's heroes
  async getPlayerHeroes(playerId: string, where?: PlayerHeroWhereInput) {
    const whereClause = this.buildPlayerHeroWhereClause(playerId, where);

    return this.prisma.playerHero.findMany({
      where: whereClause,
      include: {
        hero: true,
      },
      orderBy: { acquired_at: 'desc' },
    });
  }

  // Get specific player hero
  async getPlayerHero(playerId: string, heroId: string) {
    return this.prisma.playerHero.findFirst({
      where: {
        player_id: playerId,
        hero_id: heroId,
      },
      include: {
        hero: true,
      },
    });
  }

  // Recruit hero
  async recruitHero(playerId: string, input: RecruitHeroInput) {
    // Check if hero exists
    const hero = await this.findById(input.heroId);

    // Check if available
    if (!hero.is_available) {
      throw new BadRequestException('Hero is not available for recruitment');
    }

    // Check if already recruited
    const existing = await this.getPlayerHero(playerId, input.heroId);
    if (existing) {
      throw new BadRequestException('Hero already recruited');
    }

    // Check unlock requirements (story day)
    if (hero.story_day) {
      const progressCount = await this.prisma.dailyQuestProgress.count({
        where: {
          player_id: playerId,
          story_read: true,
        },
      });

      if (progressCount < hero.story_day) {
        throw new BadRequestException(
          `Hero requires story day ${hero.story_day}. Current day: ${progressCount}`,
        );
      }
    }

    // Calculate recruitment cost
    const cost = this.calculateRecruitmentCost(hero);

    // Check if player has enough resources
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { player_resources: true },
    });

    const hasResources = this.checkResourcesAvailable(player, cost);
    if (!hasResources) {
      throw new BadRequestException('Insufficient resources for recruitment');
    }

    // Recruit hero and deduct resources
    const [playerHero] = await Promise.all([
      this.prisma.playerHero.create({
        data: {
          player_id: playerId,
          hero_id: input.heroId,
          level: 1,
          experience: 0,
          acquired_at: new Date(),
        },
        include: {
          hero: true,
        },
      }),
      // Deduct resources
      ...this.createResourceDeductionPromises(playerId, cost),
    ]);

    return playerHero;
  }

  // Deploy hero to province
  async deployHero(playerId: string, input: DeployHeroInput) {
    // Check if player has the hero
    const playerHero = await this.prisma.playerHero.findFirst({
      where: {
        player_id: playerId,
        hero_id: input.heroId,
      },
    });

    if (!playerHero) {
      throw new NotFoundException('Hero not found in your collection');
    }

    // Check if province is unlocked
    const playerProvince = await this.prisma.playerProvince.findUnique({
      where: {
        player_id_province_id: {
          player_id: playerId,
          province_id: input.provinceId,
        },
      },
    });

    if (!playerProvince) {
      throw new NotFoundException('Province not unlocked');
    }

    // Update player hero deployment
    const updatedHero = await this.prisma.playerHero.update({
      where: { id: playerHero.id },
      data: {
        deployed_to: input.provinceId,
      },
      include: {
        hero: true,
      },
    });

    // Update province hero assignment
    await this.prisma.playerProvince.update({
      where: {
        player_id_province_id: {
          player_id: playerId,
          province_id: input.provinceId,
        },
      },
      data: {
        hero_id: input.heroId,
      },
    });

    return updatedHero;
  }

  // Level up hero
  async levelUpHero(playerId: string, input: LevelUpHeroInput) {
    // Get player hero
    const playerHero = await this.prisma.playerHero.findUnique({
      where: { id: input.playerHeroId },
      include: { hero: true },
    });

    if (!playerHero || playerHero.player_id !== playerId) {
      throw new NotFoundException('Hero not found');
    }

    const currentLevel = playerHero.level || 1;
    if (currentLevel >= 5) {
      throw new BadRequestException('Hero is already at max level (5)');
    }

    // Calculate level up cost
    const cost = this.calculateLevelUpCost(currentLevel);

    // Check if player has enough resources
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { player_resources: true },
    });

    const hasResources = this.checkResourcesAvailable(player, cost);
    if (!hasResources) {
      throw new BadRequestException('Insufficient resources for level up');
    }

    // Level up hero and deduct resources
    const [updatedHero] = await Promise.all([
      this.prisma.playerHero.update({
        where: { id: input.playerHeroId },
        data: {
          level: currentLevel + 1,
          experience: 0,
        },
        include: {
          hero: true,
        },
      }),
      // Deduct resources
      ...this.createResourceDeductionPromises(playerId, cost),
    ]);

    return updatedHero;
  }

  // Helper: Build hero where clause
  private buildHeroWhereClause(where?: HeroWhereInput) {
    if (!where) return undefined;

    const clause: any = {};

    if (where.id) {
      if (where.id.equals) clause.id = where.id.equals;
      if (where.id.contains) clause.id = { contains: where.id.contains };
    }

    if (where.nameVietnamese) {
      if (where.nameVietnamese.equals) clause.name_vietnamese = where.nameVietnamese.equals;
      if (where.nameVietnamese.contains) {
        clause.name_vietnamese = { contains: where.nameVietnamese.contains, mode: 'insensitive' };
      }
    }

    if (where.era) {
      if (where.era.equals) clause.era = where.era.equals;
      if (where.era.contains) clause.era = { contains: where.era.contains, mode: 'insensitive' };
    }

    if (where.rarity) {
      if (where.rarity.equals) clause.rarity = where.rarity.equals;
    }

    if (where.role) {
      if (where.role.equals) clause.role = where.role.equals;
    }

    if (where.isAvailable) {
      if (where.isAvailable.equals !== undefined) clause.is_available = where.isAvailable.equals;
    }

    if (where.isPremium) {
      if (where.isPremium.equals !== undefined) clause.is_premium = where.isPremium.equals;
    }

    if (where.storyDay) {
      if (where.storyDay.lte !== undefined) clause.story_day = { lte: where.storyDay.lte };
    }

    return Object.keys(clause).length > 0 ? clause : undefined;
  }

  // Helper: Build player hero where clause
  private buildPlayerHeroWhereClause(playerId: string, where?: PlayerHeroWhereInput) {
    const clause: any = { player_id: playerId };

    if (!where) return clause;

    if (where.heroId) {
      if (where.heroId.equals) clause.hero_id = where.heroId.equals;
    }

    if (where.level) {
      if (where.level.gte !== undefined) clause.level = { gte: where.level.gte };
      if (where.level.lte !== undefined) {
        clause.level = { ...clause.level, lte: where.level.lte };
      }
    }

    if (where.deployedTo) {
      if (where.deployedTo.equals !== undefined) clause.deployed_to = where.deployedTo.equals;
    }

    return clause;
  }

  // Helper: Calculate recruitment cost
  private calculateRecruitmentCost(hero: any) {
    const baseCost = hero.is_premium ? 500 : 200;
    const rarityMultiplier = {
      common: 1,
      uncommon: 1.5,
      rare: 2,
      epic: 3,
      legendary: 5,
    }[hero.rarity || 'common'] || 1;

    const cost = Math.floor(baseCost * rarityMultiplier);

    return {
      gold: cost,
      rice: Math.floor(cost * 0.8),
      wood: Math.floor(cost * 0.5),
      stone: Math.floor(cost * 0.3),
      bazan: Math.floor(cost * 0.2),
    };
  }

  // Helper: Calculate level up cost
  private calculateLevelUpCost(currentLevel: number) {
    const baseCost = 150;
    const multiplier = 2;

    const cost = Math.floor(baseCost * Math.pow(multiplier, currentLevel - 1));

    return {
      gold: cost,
      rice: Math.floor(cost * 1.2),
      wood: Math.floor(cost * 0.6),
      stone: Math.floor(cost * 0.4),
      bazan: Math.floor(cost * 0.5),
    };
  }

  // Helper: Check if player has resources
  private checkResourcesAvailable(player: any, costs: any) {
    const resources = player.player_resources || [];
    const resourceMap = new Map(resources.map((r: any) => [r.resource_type, r.amount]));

    return (
      (resourceMap.get('gold') || 0) >= costs.gold &&
      (resourceMap.get('rice') || 0) >= costs.rice &&
      (resourceMap.get('wood') || 0) >= costs.wood &&
      (resourceMap.get('stone') || 0) >= costs.stone &&
      (resourceMap.get('bazan') || 0) >= costs.bazan
    );
  }

  // Helper: Create resource deduction promises
  private createResourceDeductionPromises(playerId: string, costs: any) {
    const resources = ['gold', 'rice', 'wood', 'stone', 'bazan'];
    return resources.map((resourceType) =>
      this.prisma.playerResource.update({
        where: {
          player_id_resource_type: {
            player_id: playerId,
            resource_type: resourceType,
          },
        },
        data: {
          amount: { decrement: costs[resourceType] },
        },
      }),
    );
  }

  // ========================================
  // MVP2 SPRINT 3: HERO LEVELS & STATS SYSTEM
  // ========================================

  /**
   * Calculate hero stats based on level (1-5)
   * Each level increases stats by 20%
   */
  calculateHeroStats(playerHero: any) {
    const baseHero = playerHero.hero;
    const level = playerHero.level || 1;
    
    if (!baseHero) {
      return {
        hp: 100,
        attack: 10,
        defense: 5,
        speed: 8,
        level: level,
        baseHP: 100,
        baseAttack: 10,
        baseDefense: 5,
        baseSpeed: 8,
      };
    }

    // Base stats from hero template
    const baseHP = baseHero.base_hp || 100;
    const baseAttack = baseHero.base_attack || 10;
    const baseDefense = baseHero.base_defense || 5;
    const baseSpeed = baseHero.base_speed || 8;

    // 20% increase per level (Level 1 = 100%, Level 5 = 180%)
    const multiplier = 1 + (level - 1) * 0.2;

    return {
      hp: Math.floor(baseHP * multiplier),
      attack: Math.floor(baseAttack * multiplier),
      defense: Math.floor(baseDefense * multiplier),
      speed: Math.floor(baseSpeed * multiplier),
      level: level, // Always return level
      baseHP: baseHP,
      baseAttack: baseAttack,
      baseDefense: baseDefense,
      baseSpeed: baseSpeed,
    };
  }

  /**
   * Get experience required for next level
   * Exp requirements: Level 1→2: 100, 2→3: 250, 3→4: 500, 4→5: 1000
   */
  getExpForNextLevel(currentLevel: number): number {
    const expTable = {
      1: 100,
      2: 250,
      3: 500,
      4: 1000,
      5: 0, // Max level, no more exp needed
    };

    return expTable[currentLevel] || 0;
  }

  /**
   * Grant experience to hero
   * Auto-levels up if exp reaches threshold
   */
  async grantExpToHero(playerId: string, heroId: string, expAmount: number): Promise<any> {
    const playerHero = await this.prisma.playerHero.findFirst({
      where: {
        player_id: playerId,
        hero_id: heroId,
      },
      include: { hero: true },
    });

    if (!playerHero) {
      throw new NotFoundException('Hero not found');
    }

    const currentLevel = playerHero.level || 1;
    const currentExp = playerHero.experience || 0;

    if (currentLevel >= 5) {
      // Max level, no more exp
      return playerHero;
    }

    let newExp = currentExp + expAmount;
    let newLevel = currentLevel;

    // Check for level ups
    while (newLevel < 5) {
      const requiredExp = this.getExpForNextLevel(newLevel);
      
      if (newExp >= requiredExp) {
        newExp -= requiredExp;
        newLevel++;
      } else {
        break;
      }
    }

    // Update hero with new level and exp
    const updated = await this.prisma.playerHero.update({
      where: { id: playerHero.id },
      data: {
        level: newLevel,
        experience: newExp,
      },
      include: { hero: true },
    });

    return {
      ...updated,
      leveledUp: newLevel > currentLevel,
      levelsGained: newLevel - currentLevel,
    };
  }

  /**
   * Get hero with calculated stats
   */
  async getPlayerHeroWithStats(playerId: string, heroId: string) {
    const playerHero = await this.getPlayerHero(playerId, heroId);
    
    if (!playerHero) {
      throw new NotFoundException('Hero not found');
    }

    const stats = this.calculateHeroStats(playerHero);
    const expForNextLevel = this.getExpForNextLevel(playerHero.level || 1);

    return {
      ...playerHero,
      stats,
      expForNextLevel,
      expProgress: expForNextLevel > 0 ? ((playerHero.experience || 0) / expForNextLevel) * 100 : 100,
    };
  }

  /**
   * Get all player heroes with stats
   */
  async getPlayerHeroesWithStats(playerId: string) {
    const heroes = await this.getPlayerHeroes(playerId);

    return heroes.map((playerHero) => {
      const stats = this.calculateHeroStats(playerHero);
      const expForNextLevel = this.getExpForNextLevel(playerHero.level || 1);

      return {
        ...playerHero,
        stats,
        expForNextLevel,
        expProgress: expForNextLevel > 0 ? ((playerHero.experience || 0) / expForNextLevel) * 100 : 100,
      };
    });
  }
}
