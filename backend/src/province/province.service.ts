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

  // Upgrade province (farmer/resource/development)
  async upgradeProvince(playerId: string, input: UpgradeProvinceInput) {
    this.logger.log(`🔧 Upgrade request: Player=${playerId}, Province=${input.provinceId}, Type=${input.upgradeType}`);
    
    // Get player province
    const playerProvince = await this.getPlayerProvince(playerId, input.provinceId);
    if (!playerProvince) {
      this.logger.error(`❌ Province ${input.provinceId} not unlocked for player ${playerId}`);
      throw new NotFoundException('Province not unlocked');
    }

    this.logger.debug(`📊 Current province state: ${JSON.stringify({
      provinceId: playerProvince.province_id,
      farmerLevel: playerProvince.farmer_level,
      resourceLevel: playerProvince.resource_level,
      developmentLevel: playerProvince.development_level,
    })}`);

    // Calculate upgrade costs
    const costs = this.calculateUpgradeCosts(playerProvince, input.upgradeType);
    this.logger.log(`💰 Upgrade costs: ${JSON.stringify(costs)}`);

    // Check if player has enough resources
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { player_resources: true },
    });

    this.logger.debug(`🏦 Player resources: ${JSON.stringify(
      player?.player_resources.map(r => ({ type: r.resource_type, amount: r.amount }))
    )}`);

    const hasResources = this.checkResourcesAvailable(player, costs);
    if (!hasResources) {
      this.logger.error(`❌ Insufficient resources. Required: ${JSON.stringify(costs)}`);
      throw new BadRequestException('Insufficient resources');
    }

    this.logger.log(`✅ Resource check passed`);

    // Deduct resources and upgrade
    const updateData = this.getUpgradeUpdateData(input.upgradeType, playerProvince);
    this.logger.debug(`📝 Update data: ${JSON.stringify(updateData)}`);

    const [updatedProvince] = await Promise.all([
      this.prisma.playerProvince.update({
        where: {
          player_id_province_id: {
            player_id: playerId,
            province_id: input.provinceId,
          },
        },
        data: updateData,
        include: {
          province: true,
          hero: true,
        },
      }),
      // Deduct resources
      ...this.createResourceDeductionPromises(playerId, costs),
    ]);

    this.logger.log(`✅ Upgrade completed successfully! New ${input.upgradeType}_level: ${updatedProvince[`${input.upgradeType}_level`]}`);

    return updatedProvince;
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
    const level = playerProvince[`${upgradeType}_level`] || 1;
    
    // Match Motia backend costs exactly
    if (upgradeType === 'farmer') {
      return {
        gold: 500 * level,
        rice: 300 * level,
      };
    } else if (upgradeType === 'resource') {
      return {
        gold: 800 * level,
        wood: 400 * level,
      };
    } else if (upgradeType === 'development') {
      return {
        gold: 1000 * level,
        rice: 500 * level,
        wood: 300 * level,
        stone: 200 * level,
      };
    }
    
    return {};
  }

  // Helper: Check if player has resources
  private checkResourcesAvailable(player: any, costs: any) {
    const resources = player.player_resources || [];
    const resourceMap = new Map(resources.map((r: any) => [r.resource_type, r.amount]));

    // Only check resources that are actually required for this upgrade
    for (const [resourceType, amount] of Object.entries(costs)) {
      const requiredAmount = amount as number;
      const availableAmount = (resourceMap.get(resourceType) as number) || 0;
      
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

    if (upgradeType === 'farmer') {
      updateData.farmer_level = (playerProvince.farmer_level || 1) + 1;
    } else if (upgradeType === 'resource') {
      updateData.resource_level = (playerProvince.resource_level || 1) + 1;
    } else if (upgradeType === 'development') {
      updateData.development_level = (playerProvince.development_level || 1) + 1;
    }

    return updateData;
  }

  // Helper: Create resource deduction promises
  private createResourceDeductionPromises(playerId: string, costs: any) {
    // Only deduct resources that are actually being used (have non-zero cost)
    return Object.entries(costs)
      .filter(([_, amount]) => (amount as number) > 0)
      .map(([resourceType, amount]) =>
        this.prisma.playerResource.update({
          where: {
            player_id_resource_type: {
              player_id: playerId,
              resource_type: resourceType,
            },
          },
          data: {
            amount: { decrement: amount as number },
          },
        }),
      );
  }
}
