import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProvinceWhereInput, PlayerProvinceWhereInput, UnlockProvinceInput, UpgradeProvinceInput } from '../graphql/inputs/province.input';

@Injectable()
export class ProvinceService {
  private readonly logger = new Logger(ProvinceService.name);
  
  constructor(private prisma: PrismaService) {}

  // Get all provinces
  async findAll(where?: ProvinceWhereInput, skip?: number, take?: number) {
    const whereClause = this.buildProvinceWhereClause(where);

    const [provinces, total] = await Promise.all([
      this.prisma.province.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { unlock_order: 'asc' },
      }),
      this.prisma.province.count({ where: whereClause }),
    ]);

    return { provinces, total };
  }

  // Get province by ID
  async findById(id: number) {
    const province = await this.prisma.province.findUnique({
      where: { id },
    });

    if (!province) {
      throw new NotFoundException(`Province with ID ${id} not found`);
    }

    return province;
  }

  // Get player's unlocked provinces
  async getPlayerProvinces(playerId: string, where?: PlayerProvinceWhereInput) {
    const whereClause = this.buildPlayerProvinceWhereClause(playerId, where);

    return this.prisma.playerProvince.findMany({
      where: whereClause,
      include: {
        province: true,
        hero: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // Get specific player province
  async getPlayerProvince(playerId: string, provinceId: number) {
    return this.prisma.playerProvince.findUnique({
      where: {
        player_id_province_id: {
          player_id: playerId,
          province_id: provinceId,
        },
      },
      include: {
        province: true,
        hero: true,
      },
    });
  }

  // Unlock province for player
  async unlockProvince(playerId: string, input: UnlockProvinceInput) {
    this.logger.log(`🔓 Unlock request: Player=${playerId}, Province=${input.provinceId}`);
    
    // Check if province exists
    const province = await this.findById(input.provinceId);
    this.logger.debug(`📍 Province found: ${province.name} (Region: ${province.region})`);

    // Check if already unlocked
    const existing = await this.getPlayerProvince(playerId, input.provinceId);
    if (existing) {
      this.logger.error(`❌ Province ${input.provinceId} already unlocked`);
      throw new BadRequestException('Province already unlocked');
    }

    // Check unlock requirements (story day)
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    // Get player's progress (count distinct quest dates as days)
    const progressCount = await this.prisma.dailyQuestProgress.count({
      where: {
        player_id: playerId,
        story_read: true,
      },
    });

    const currentDay = progressCount;
    this.logger.debug(`📅 Player progress: Day ${currentDay}, Required: ${province.unlock_story_day || 'No requirement'}`);
    
    if (province.unlock_story_day && currentDay < province.unlock_story_day) {
      this.logger.error(`❌ Unlock requirements not met: Need day ${province.unlock_story_day}, current day ${currentDay}`);
      throw new BadRequestException(
        `Province requires story day ${province.unlock_story_day}. Current day: ${currentDay}`,
      );
    }

    // Create player province
    const newPlayerProvince = await this.prisma.playerProvince.create({
      data: {
        player_id: playerId,
        province_id: input.provinceId,
        hero_id: input.heroId,
        farmer_level: 1,
        resource_level: 1,
        development_level: 1,
        buildings_count: 0,
      },
      include: {
        province: true,
        hero: true,
      },
    });

    this.logger.log(`✅ Province ${province.name} unlocked successfully!`);
    return newPlayerProvince;
  }

  // Upgrade province (farmer/resource/development) - Now Asynchronous
  async upgradeProvince(playerId: string, input: UpgradeProvinceInput) {
    this.logger.log(`🔧 Upgrade request: Player=${playerId}, Province=${input.provinceId}, Type=${input.upgradeType}`);
    
    // Get player province
    const playerProvince = await this.getPlayerProvince(playerId, input.provinceId);
    if (!playerProvince) {
      throw new NotFoundException('Province not unlocked');
    }

    if ((playerProvince as any).is_upgrading) {
      throw new BadRequestException('Another upgrade is already in progress for this province');
    }

    // Normalize upgrade type
    const normalizedUpgradeType = input.upgradeType.toLowerCase();
    
    // Calculate upgrade costs
    const costs = this.calculateUpgradeCosts(playerProvince, normalizedUpgradeType);
    
    // Check if player has enough resources
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!this.checkResourcesAvailable(player, costs)) {
      throw new BadRequestException('Insufficient resources');
    }

    // Calculate upgrade time (seconds)
    const level = playerProvince[`${normalizedUpgradeType}_level`] || 1;
    const upgradeTimeSeconds = this.calculateUpgradeTime(level);
    const upgradeEndsAt = new Date(Date.now() + upgradeTimeSeconds * 1000);

    // Deduct resources
    await this.deductPlayerResources(playerId, costs);

    // Set upgrade in progress
    const updatedProvince = await this.prisma.playerProvince.update({
      where: {
        player_id_province_id: {
          player_id: playerId,
          province_id: input.provinceId,
        },
      },
      data: {
        is_upgrading: true,
        upgrading_type: normalizedUpgradeType.toUpperCase(),
        upgrade_ends_at: upgradeEndsAt,
      } as any,
      include: {
        province: true,
        hero: true,
      },
    });

    this.logger.log(`✅ Upgrade for ${normalizedUpgradeType} started! Ends at ${upgradeEndsAt}`);

    return updatedProvince;
  }

  // Finish an upgrade that has completed its time
  async finishUpgrade(playerId: string, provinceId: number) {
    const playerProvince = await this.getPlayerProvince(playerId, provinceId);
    if (!playerProvince || !(playerProvince as any).is_upgrading) {
      throw new BadRequestException('No upgrade in progress');
    }

    const now = new Date();
    if (new Date((playerProvince as any).upgrade_ends_at) > now) {
      const remaining = Math.ceil((new Date((playerProvince as any).upgrade_ends_at).getTime() - now.getTime()) / 1000);
      throw new BadRequestException(`Upgrade still in progress. ${remaining}s remaining.`);
    }

    const upgradeType = (playerProvince as any).upgrading_type.toLowerCase();
    const updateData = this.getUpgradeUpdateData(upgradeType, playerProvince);
    
    // Clear upgrade status and increment level
    const updated = await this.prisma.playerProvince.update({
      where: {
        player_id_province_id: {
          player_id: playerId,
          province_id: provinceId,
        },
      },
      data: {
        ...updateData,
        is_upgrading: false,
        upgrading_type: null,
        upgrade_ends_at: null,
      } as any,
      include: {
        province: true,
        hero: true,
      },
    });

    this.logger.log(`🎉 Upgrade for ${upgradeType} finished successfully!`);
    return updated;
  }

  // Use Gems to finish an upgrade instantly (Time-Skip)
  async timeSkipUpgrade(playerId: string, provinceId: number) {
    const playerProvince = await this.getPlayerProvince(playerId, provinceId);
    if (!playerProvince || !(playerProvince as any).is_upgrading) {
      throw new BadRequestException('No upgrade in progress');
    }

    const now = new Date();
    const remainingMs = new Date((playerProvince as any).upgrade_ends_at).getTime() - now.getTime();
    if (remainingMs <= 0) return this.finishUpgrade(playerId, provinceId);

    // Calculate Gems cost: 1 Gem per 1 minute (minimum 10 Gems)
    const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
    const gemsCost = Math.max(10, remainingMinutes);

    // Deduct Gems
    await this.deductPlayerResources(playerId, { gems: gemsCost });

    // Complete instantly
    const upgradeType = (playerProvince as any).upgrading_type.toLowerCase();
    const updateData = this.getUpgradeUpdateData(upgradeType, playerProvince);
    
    const updated = await this.prisma.playerProvince.update({
      where: {
        player_id_province_id: {
          player_id: playerId,
          province_id: provinceId,
        },
      },
      data: {
        ...updateData,
        is_upgrading: false,
        upgrading_type: null,
        upgrade_ends_at: null,
      } as any,
      include: {
        province: true,
        hero: true,
      },
    });

    this.logger.log(`💎 Time-skip used! ${gemsCost} Gems spent to finish ${upgradeType} instantly.`);
    return updated;
  }

  // Calculate upgrade time in seconds
  private calculateUpgradeTime(currentLevel: number): number {
    // Level 1 -> 2: 1 min (60s)
    // Level 5 -> 6: ~16 min
    // Level 10 -> 11: ~17 hours
    return 60 * Math.pow(2, currentLevel - 1);
  }

  // Helper: Build province where clause
  private buildProvinceWhereClause(where?: ProvinceWhereInput) {
    if (!where) return undefined;

    const clause: any = {};

    if (where.id) {
      if (where.id.equals !== undefined) clause.id = where.id.equals;
      if (where.id.in) clause.id = { in: where.id.in };
      if (where.id.gte !== undefined || where.id.lte !== undefined) {
        clause.id = {
          ...(where.id.gte !== undefined && { gte: where.id.gte }),
          ...(where.id.lte !== undefined && { lte: where.id.lte }),
        };
      }
    }

    if (where.name) {
      if (where.name.equals) clause.name = where.name.equals;
      if (where.name.contains) clause.name = { contains: where.name.contains, mode: 'insensitive' };
    }

    if (where.region) {
      if (where.region.equals) clause.region = where.region.equals;
      if (where.region.contains) clause.region = { contains: where.region.contains, mode: 'insensitive' };
    }

    if (where.is_capital) {
      if (where.is_capital.equals !== undefined) clause.is_capital = where.is_capital.equals;
    }

    if (where.unlock_order) {
      if (where.unlock_order.equals !== undefined) clause.unlock_order = where.unlock_order.equals;
      if (where.unlock_order.lte !== undefined) clause.unlock_order = { lte: where.unlock_order.lte };
    }

    return Object.keys(clause).length > 0 ? clause : undefined;
  }

  // Helper: Build player province where clause
  private buildPlayerProvinceWhereClause(playerId: string, where?: PlayerProvinceWhereInput) {
    const clause: any = { player_id: playerId };

    if (!where) return clause;

    if (where.province_id) {
      if (where.province_id.equals !== undefined) clause.province_id = where.province_id.equals;
      if (where.province_id.in) clause.province_id = { in: where.province_id.in };
    }

    if (where.farmer_level) {
      if (where.farmer_level.gte !== undefined) clause.farmer_level = { gte: where.farmer_level.gte };
    }

    if (where.resource_level) {
      if (where.resource_level.gte !== undefined) clause.resource_level = { gte: where.resource_level.gte };
    }

    if (where.development_level) {
      if (where.development_level.gte !== undefined) {
        clause.development_level = { gte: where.development_level.gte };
      }
    }

    return clause;
  }

  // Helper: Calculate upgrade costs
  private calculateUpgradeCosts(playerProvince: any, upgradeType: string) {
    // Normalize to lowercase for case-insensitive comparison
    const normalizedType = upgradeType.toLowerCase();
    const level = playerProvince[`${normalizedType}_level`] || 1;
    
    // Match database resource field names: gold, rice, lumber, stone, culture, gems, bazan
    if (normalizedType === 'farmer') {
      return {
        gold: 500 * level,
        rice: 300 * level,
      };
    } else if (normalizedType === 'resource') {
      return {
        gold: 800 * level,
        lumber: 400 * level, // Fixed: was 'wood', now 'lumber'
      };
    } else if (normalizedType === 'development') {
      return {
        gold: 1000 * level,
        rice: 600 * level, // Updated from 500
        lumber: 300 * level, // Fixed: was 'wood', now 'lumber'
        stone: 200 * level,
      };
    }
    
    return {};
  }

  // Helper: Check if player has resources
  private checkResourcesAvailable(player: any, costs: any) {
    // Player resources are stored in JSON field 'resources'
    const resources = player?.resources || {};
    
    this.logger.debug(`📦 Available resources: ${JSON.stringify(resources)}`);

    // Check each required resource
    for (const [resourceType, amount] of Object.entries(costs)) {
      const requiredAmount = amount as number;
      const availableAmount = (resources[resourceType] as number) || 0;
      
      if (availableAmount < requiredAmount) {
        this.logger.warn(`⚠️  Insufficient ${resourceType}: Have ${availableAmount}, Need ${requiredAmount}`);
        return false;
      }
      
      this.logger.debug(`✓ ${resourceType}: ${availableAmount} >= ${requiredAmount}`);
    }
    
    return true;
  }

  // Helper: Get upgrade update data
  private getUpgradeUpdateData(upgradeType: string, playerProvince: any) {
    const updateData: any = {};
    
    // Normalize to lowercase for case-insensitive comparison
    const normalizedType = upgradeType.toLowerCase();

    if (normalizedType === 'farmer') {
      updateData.farmer_level = (playerProvince.farmer_level || 1) + 1;
    } else if (normalizedType === 'resource') {
      updateData.resource_level = (playerProvince.resource_level || 1) + 1;
    } else if (normalizedType === 'development') {
      updateData.development_level = (playerProvince.development_level || 1) + 1;
    } else if (normalizedType === 'spiral') {
      updateData.spiral_layers = (playerProvince.spiral_layers || 0) + 1;
    }

    return updateData;
  }

  // Helper: Create resource deduction promises
  private async deductPlayerResources(playerId: string, costs: any) {
    // Get current player resources
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { resources: true },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    // Create new resources object with deductions
    const currentResources = (player.resources as any) || {};
    const updatedResources = { ...currentResources };

    // Deduct costs from resources
    for (const [resourceType, amount] of Object.entries(costs)) {
      const deductAmount = amount as number;
      if (deductAmount > 0) {
        const currentAmount = (updatedResources[resourceType] as number) || 0;
        updatedResources[resourceType] = Math.max(0, currentAmount - deductAmount);
        this.logger.debug(`💸 Deducting ${resourceType}: ${currentAmount} - ${deductAmount} = ${updatedResources[resourceType]}`);
      }
    }

    // Update player resources
    await this.prisma.player.update({
      where: { id: playerId },
      data: { resources: updatedResources },
    });
    
    this.logger.log(`✅ Resources deducted successfully`);
  }

  // ========================================
  // MVP2 SPRINT 2: PROVINCE SKILLS SYSTEM
  // ========================================

  /**
   * Calculate passive buffs based on province levels
   * Passive buffs unlock at levels 5, 10, 15
   * Each milestone provides cumulative bonuses
   */
  calculatePassiveBuffs(playerProvince: any) {
    const buffs: any[] = [];
    
    const farmerLevel = playerProvince.farmer_level || 1;
    const resourceLevel = playerProvince.resource_level || 1;
    const developmentLevel = playerProvince.development_level || 1;

    // Farmer Level Buffs
    if (farmerLevel >= 5) {
      buffs.push({
        type: 'GOLD_PRODUCTION',
        value: 10,
        description: 'Tăng 10% sản xuất vàng',
        source: 'FARMER_LEVEL_5',
        icon: '💰',
      });
    }
    if (farmerLevel >= 10) {
      buffs.push({
        type: 'RICE_PRODUCTION',
        value: 15,
        description: 'Tăng 15% sản xuất lúa',
        source: 'FARMER_LEVEL_10',
        icon: '🌾',
      });
    }
    if (farmerLevel >= 15) {
      buffs.push({
        type: 'ALL_PRODUCTION',
        value: 20,
        description: 'Tăng 20% tất cả sản xuất',
        source: 'FARMER_LEVEL_15',
        icon: '⭐',
      });
    }

    // Resource Level Buffs
    if (resourceLevel >= 5) {
      buffs.push({
        type: 'WOOD_PRODUCTION',
        value: 10,
        description: 'Tăng 10% sản xuất gỗ',
        source: 'RESOURCE_LEVEL_5',
        icon: '🪵',
      });
    }
    if (resourceLevel >= 10) {
      buffs.push({
        type: 'STONE_PRODUCTION',
        value: 15,
        description: 'Tăng 15% sản xuất đá',
        source: 'RESOURCE_LEVEL_10',
        icon: '🪨',
      });
    }
    if (resourceLevel >= 15) {
      buffs.push({
        type: 'RESOURCE_EFFICIENCY',
        value: 25,
        description: 'Tăng 25% hiệu quả tài nguyên',
        source: 'RESOURCE_LEVEL_15',
        icon: '💎',
      });
    }

    // Development Level Buffs
    if (developmentLevel >= 5) {
      buffs.push({
        type: 'BUILDING_SPEED',
        value: 10,
        description: 'Tăng 10% tốc độ xây dựng',
        source: 'DEVELOPMENT_LEVEL_5',
        icon: '🏗️',
      });
    }
    if (developmentLevel >= 10) {
      buffs.push({
        type: 'HERO_EXP',
        value: 15,
        description: 'Tăng 15% kinh nghiệm hero',
        source: 'DEVELOPMENT_LEVEL_10',
        icon: '⚔️',
      });
    }
    if (developmentLevel >= 15) {
      buffs.push({
        type: 'CULTURE_GAIN',
        value: 30,
        description: 'Tăng 30% văn hóa',
        source: 'DEVELOPMENT_LEVEL_15',
        icon: '🎭',
      });
    }

    return buffs;
  }

  /**
   * Get active skill for a province based on its development level
   * Active skills have 24-hour cooldown
   */
  getActiveSkill(playerProvince: any) {
    const developmentLevel = playerProvince.development_level || 1;
    
    // Active skill unlocks at development level 10
    if (developmentLevel < 10) {
      return null;
    }

    // Determine skill tier based on level
    let skillTier = 1;
    if (developmentLevel >= 20) skillTier = 3;
    else if (developmentLevel >= 15) skillTier = 2;

    const skills = {
      1: {
        id: 'RESOURCE_BOOST_1',
        name: 'Tăng Sản Xuất I',
        description: 'x2 sản xuất tất cả tài nguyên trong 1 giờ',
        multiplier: 2,
        duration_hours: 1,
        cooldown_hours: 24,
        icon: '🚀',
      },
      2: {
        id: 'RESOURCE_BOOST_2',
        name: 'Tăng Sản Xuất II',
        description: 'x3 sản xuất tất cả tài nguyên trong 2 giờ',
        multiplier: 3,
        duration_hours: 2,
        cooldown_hours: 24,
        icon: '⚡',
      },
      3: {
        id: 'RESOURCE_BOOST_3',
        name: 'Tăng Sản Xuất III',
        description: 'x5 sản xuất tất cả tài nguyên trong 3 giờ',
        multiplier: 5,
        duration_hours: 3,
        cooldown_hours: 24,
        icon: '💥',
      },
    };

    return skills[skillTier];
  }

  /**
   * Check if active skill is on cooldown
   */
  getSkillCooldownStatus(playerProvince: any) {
    const cooldownEnds = playerProvince.active_skill_cooldown_ends;
    
    if (!cooldownEnds) {
      return {
        isOnCooldown: false,
        remainingSeconds: 0,
        canUse: true,
      };
    }

    const now = new Date();
    const cooldownDate = new Date(cooldownEnds);
    const remainingMs = cooldownDate.getTime() - now.getTime();
    
    if (remainingMs <= 0) {
      return {
        isOnCooldown: false,
        remainingSeconds: 0,
        canUse: true,
      };
    }

    return {
      isOnCooldown: true,
      remainingSeconds: Math.ceil(remainingMs / 1000),
      remainingHours: Math.ceil(remainingMs / (1000 * 60 * 60)),
      canUse: false,
    };
  }

  /**
   * Use active skill
   * Sets 24-hour cooldown
   */
  async useActiveSkill(playerId: string, provinceId: number) {
    this.logger.log(`🔥 Use active skill: Player=${playerId}, Province=${provinceId}`);
    
    // Get player province
    const playerProvince = await this.getPlayerProvince(playerId, provinceId);
    if (!playerProvince) {
      throw new NotFoundException('Province not unlocked');
    }

    // Check if skill is available
    const skill = this.getActiveSkill(playerProvince);
    if (!skill) {
      throw new BadRequestException('Active skill not unlocked (requires development level 10)');
    }

    // Check cooldown
    const cooldownStatus = this.getSkillCooldownStatus(playerProvince);
    if (cooldownStatus.isOnCooldown) {
      throw new BadRequestException(
        `Skill is on cooldown. ${cooldownStatus.remainingHours} hours remaining`,
      );
    }

    // Set cooldown (24 hours from now)
    const now = new Date();
    const cooldownEnds = new Date(now.getTime() + skill.cooldown_hours * 60 * 60 * 1000);

    const updated = await this.prisma.playerProvince.update({
      where: {
        player_id_province_id: {
          player_id: playerId,
          province_id: provinceId,
        },
      },
      data: {
        active_skill_last_used: now,
        active_skill_cooldown_ends: cooldownEnds,
        active_skill_level: skill.multiplier, // Store multiplier for active effect
      },
      include: {
        province: true,
        hero: true,
      },
    });

    this.logger.log(`✅ Active skill used! Effect: x${skill.multiplier} for ${skill.duration_hours}h`);
    
    return {
      playerProvince: updated,
      skill,
      cooldownEnds,
      effectEnds: new Date(now.getTime() + skill.duration_hours * 60 * 60 * 1000),
    };
  }

  /**
   * Get province with all skills info
   */
  async getProvinceWithSkills(playerId: string, provinceId: number) {
    const playerProvince = await this.getPlayerProvince(playerId, provinceId);
    
    if (!playerProvince) {
      throw new NotFoundException('Province not unlocked');
    }

    // Calculate passive buffs
    const passiveBuffs = this.calculatePassiveBuffs(playerProvince);

    // Get Relic buffs
    const relicBuffs = await this.calculateRelicBuffs(playerId, provinceId);

    // Get Spiral buffs
    const spiralBuffs = this.calculateSpiralBuffs(playerProvince);
    
    // Combine all
    const allPassiveBuffs = [...passiveBuffs, ...relicBuffs, ...spiralBuffs];

    // Get active skill
    const activeSkill = this.getActiveSkill(playerProvince);
    const cooldownStatus = activeSkill ? this.getSkillCooldownStatus(playerProvince) : null;

    return {
      ...playerProvince,
      passiveBuffs: allPassiveBuffs,
      activeSkill,
      skillCooldown: cooldownStatus,
    };
  }

  /**
   * Calculate buffs from relics placed in this province
   */
  async calculateRelicBuffs(playerId: string, provinceId: number) {
    const playerRelics = await this.prisma.playerRelic.findMany({
      where: {
        player_id: playerId,
        province_id: provinceId,
      },
      include: {
        relic: true,
      },
    });

    return playerRelics.map((pr) => ({
      type: pr.relic.aura_type,
      value: Number(pr.relic.aura_value) * 100,
      description: `Di vật: ${pr.relic.name}`,
      source: `RELIC_${pr.relic.id}`,
      icon: '🏺',
    }));
  }

  /**
   * Upgrade Spiral Construction (Thành Cổ Loa)
   */
  async upgradeSpiral(playerId: string, provinceId: number) {
    const playerProvince = await this.getPlayerProvince(playerId, provinceId);
    if (!playerProvince) throw new NotFoundException('Province not unlocked');

    const currentLayers = (playerProvince as any).spiral_layers || 0;
    const nextLayer = currentLayers + 1;

    // Spiral Construction costs more at each layer (Stone and Wood/Lumber)
    const costs = {
      stone: 1000 * Math.pow(2, currentLayers),
      lumber: 800 * Math.pow(2, currentLayers),
      gold: 500 * Math.pow(2, currentLayers),
    };

    // Check resources
    const player = await this.prisma.player.findUnique({ where: { id: playerId } });
    if (!this.checkResourcesAvailable(player, costs)) {
      throw new BadRequestException('Không đủ tài nguyên để xây dựng thành quách (Cần đá, gỗ và vàng)');
    }

    if ((playerProvince as any).is_upgrading) {
      throw new BadRequestException('Another upgrade is already in progress');
    }

    // Calculate upgrade time
    const upgradeTimeSeconds = 300 * Math.pow(2, currentLayers); // Spiral takes longer (5 min base)
    const upgradeEndsAt = new Date(Date.now() + upgradeTimeSeconds * 1000);

    // Deduct and Update to starting state
    await this.deductPlayerResources(playerId, costs);
    
    const updated = await this.prisma.playerProvince.update({
      where: {
        player_id_province_id: {
          player_id: playerId,
          province_id: provinceId,
        },
      },
      data: {
        is_upgrading: true,
        upgrading_type: 'SPIRAL',
        upgrade_ends_at: upgradeEndsAt,
      } as any,
      include: {
        province: true,
        hero: true,
      },
    });

    this.logger.log(`🏯 Spiral upgrade started to layer ${nextLayer} for province ${provinceId}`);
    return updated;
  }

  /**
   * Calculate buffs from spiral construction
   */
  private calculateSpiralBuffs(playerProvince: any) {
    const layers = (playerProvince as any).spiral_layers || 0;
    if (layers === 0) return [];

    const buffs: any[] = [];
    
    // Layer 1: Basic fortification (+20% Defense)
    if (layers >= 1) {
      buffs.push({
        type: 'DEFENSE',
        value: 20,
        description: 'Thành Cổ Loa: Vòng Ngoài (+20% Thủ)',
        source: 'SPIRAL_LAYER_1',
        icon: '🧱',
      });
    }

    // Layer 2: Intermediate fortification (+15% Production)
    if (layers >= 2) {
      buffs.push({
        type: 'PRODUCTION_ALL',
        value: 15,
        description: 'Thành Cổ Loa: Vòng Trung (+15% Sản xuất)',
        source: 'SPIRAL_LAYER_2',
        icon: '🌀',
      });
    }

    // Layer 3: Advanced fortification (+25% Defense, +10% All Output)
    if (layers >= 3) {
      buffs.push({
        type: 'DEFENSE_ELITE',
        value: 25,
        description: 'Thành Cổ Loa: Vòng Nội (+25% Thủ Cực Hạn)',
        source: 'SPIRAL_LAYER_3',
        icon: '🏰',
      });
    }

    return buffs;
  }
}
