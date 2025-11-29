import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * ResourceSynergyService - MVP2 Sprint 4
 * 
 * Wu Xing (Five Elements) Synergy System
 * Wood → Fire → Earth → Metal → Water → Wood (cycle)
 * 
 * When provinces produce resources following this cycle,
 * they get 10% production bonus
 */
@Injectable()
export class ResourceSynergyService {
  constructor(private readonly prisma: PrismaService) {}

  // ========================================
  // WU XING CYCLE CONFIGURATION
  // ========================================

  /**
   * Wu Xing cycle relationships
   * Each element generates/feeds the next element
   */
  private readonly wuXingCycle = {
    wood: 'fire',    // Wood feeds Fire
    fire: 'earth',   // Fire creates Earth (ash)
    earth: 'metal',  // Earth contains Metal
    metal: 'water',  // Metal collects Water (condensation)
    water: 'wood',   // Water nourishes Wood
  };

  /**
   * Resource to element mapping
   */
  private readonly resourceElements: Record<string, string> = {
    wood: 'wood',
    rice: 'water',     // Rice needs water
    gold: 'metal',
    stone: 'earth',
    bazan: 'fire',     // Bazan (fire element resource)
  };

  /**
   * Vietnamese names for elements
   */
  private readonly elementNames: Record<string, string> = {
    wood: 'Mộc (Gỗ)',
    fire: 'Hỏa (Lửa)',
    earth: 'Thổ (Đất)',
    metal: 'Kim (Vàng)',
    water: 'Thủy (Nước)',
  };

  /**
   * Element emojis
   */
  private readonly elementEmojis: Record<string, string> = {
    wood: '🌳',
    fire: '🔥',
    earth: '🏔️',
    metal: '⚔️',
    water: '💧',
  };

  // ========================================
  // SYNERGY CALCULATION
  // ========================================

  /**
   * Calculate synergy bonuses for a player's provinces
   * Returns provinces with active synergies and bonus percentages
   */
  async calculatePlayerSynergies(playerId: string) {
    // Get all player provinces with production data
    const provinces = await this.prisma.playerProvince.findMany({
      where: { player_id: playerId },
      include: {
        province: true,
      },
    });

    // Group provinces by primary production type
    const productionGroups: Record<string, any[]> = {
      wood: [],
      rice: [],
      gold: [],
      stone: [],
      bazan: [],
    };

    provinces.forEach((playerProvince) => {
      const province = playerProvince.province;
      
      // Determine primary production based on province characteristics
      if (province.base_wood_rate && Number(province.base_wood_rate) > 0) {
        productionGroups.wood.push(playerProvince);
      }
      if (province.base_rice_rate && Number(province.base_rice_rate) > 0) {
        productionGroups.rice.push(playerProvince);
      }
      if (province.base_gold_rate && Number(province.base_gold_rate) > 0) {
        productionGroups.gold.push(playerProvince);
      }
      if (province.base_stone_rate && Number(province.base_stone_rate) > 0) {
        productionGroups.stone.push(playerProvince);
      }
      if (province.base_bazan_rate && Number(province.base_bazan_rate) > 0) {
        productionGroups.bazan.push(playerProvince);
      }
    });

    // Calculate active synergies
    const activeSynergies: any[] = [];
    const resourceTypes = Object.keys(this.resourceElements);

    resourceTypes.forEach((resourceType) => {
      const element = this.resourceElements[resourceType];
      const nextElement = this.wuXingCycle[element];
      const nextResource = this.getResourceByElement(nextElement);

      // Check if both resources are being produced
      const hasSource = productionGroups[resourceType].length > 0;
      const hasTarget = productionGroups[nextResource].length > 0;

      if (hasSource && hasTarget) {
        activeSynergies.push({
          sourceResource: resourceType,
          targetResource: nextResource,
          sourceElement: element,
          targetElement: nextElement,
          bonusPercentage: 10, // 10% production bonus
          affectedProvinces: productionGroups[nextResource].length,
          description: `${this.elementNames[element]} sinh ${this.elementNames[nextElement]}`,
          icon: `${this.elementEmojis[element]} → ${this.elementEmojis[nextElement]}`,
        });
      }
    });

    return {
      playerId,
      totalProvinces: provinces.length,
      activeSynergies,
      totalBonusPercentage: activeSynergies.length * 10,
      cycleCompletion: (activeSynergies.length / 5) * 100, // % of full cycle
    };
  }

  /**
   * Check if a specific province benefits from synergy
   */
  async checkProvinceSynergy(playerId: string, provinceId: number) {
    const playerProvince = await this.prisma.playerProvince.findFirst({
      where: {
        player_id: playerId,
        province_id: provinceId,
      },
      include: {
        province: true,
      },
    });

    if (!playerProvince) {
      throw new NotFoundException('Province not found');
    }

    // Get all synergies
    const synergies = await this.calculatePlayerSynergies(playerId);

    // Determine province's primary resources
    const province = playerProvince.province;
    const primaryResources: string[] = [];

    if (province.base_wood_rate && Number(province.base_wood_rate) > 0) primaryResources.push('wood');
    if (province.base_rice_rate && Number(province.base_rice_rate) > 0) primaryResources.push('rice');
    if (province.base_gold_rate && Number(province.base_gold_rate) > 0) primaryResources.push('gold');
    if (province.base_stone_rate && Number(province.base_stone_rate) > 0) primaryResources.push('stone');
    if (province.base_bazan_rate && Number(province.base_bazan_rate) > 0) primaryResources.push('bazan');

    // Find applicable synergies
    const applicableSynergies = synergies.activeSynergies.filter(
      (synergy) => primaryResources.includes(synergy.targetResource),
    );

    return {
      provinceId,
      provinceName: province.name || 'Unknown',
      primaryResources,
      applicableSynergies,
      totalBonus: applicableSynergies.reduce((sum, s) => sum + s.bonusPercentage, 0),
      hasSynergy: applicableSynergies.length > 0,
    };
  }

  /**
   * Apply synergy bonuses to resource production
   */
  applyProductionBonus(baseProduction: number, bonusPercentage: number): number {
    return Math.floor(baseProduction * (1 + bonusPercentage / 100));
  }

  /**
   * Get resource type by element
   */
  private getResourceByElement(element: string): string {
    const entry = Object.entries(this.resourceElements).find(
      ([, el]) => el === element,
    );
    return entry ? entry[0] : 'wood';
  }

  // ========================================
  // WU XING CYCLE VISUALIZATION DATA
  // ========================================

  /**
   * Get complete Wu Xing cycle data for frontend visualization
   */
  async getWuXingCycleData(playerId: string) {
    const synergies = await this.calculatePlayerSynergies(playerId);

    // Build cycle nodes
    const elements = ['wood', 'fire', 'earth', 'metal', 'water'];
    const cycleNodes = elements.map((element) => {
      const resource = this.getResourceByElement(element);
      const nextElement = this.wuXingCycle[element];
      const nextResource = this.getResourceByElement(nextElement);

      // Check if this edge is active
      const isActive = synergies.activeSynergies.some(
        (s) => s.sourceElement === element && s.targetElement === nextElement,
      );

      return {
        element,
        elementName: this.elementNames[element],
        emoji: this.elementEmojis[element],
        resource,
        resourceNameVN: this.getResourceNameVN(resource),
        nextElement,
        nextResource,
        isActive,
        bonusPercentage: isActive ? 10 : 0,
      };
    });

    return {
      playerId,
      cycleNodes,
      activeSynergies: synergies.activeSynergies,
      cycleCompletion: synergies.cycleCompletion,
      totalBonus: synergies.totalBonusPercentage,
      description: 'Hệ thống Ngũ Hành: Mộc → Hỏa → Thổ → Kim → Thủy',
    };
  }

  /**
   * Get Vietnamese resource name
   */
  private getResourceNameVN(resource: string): string {
    const names: Record<string, string> = {
      wood: 'Gỗ',
      rice: 'Lúa',
      gold: 'Vàng',
      stone: 'Đá',
      bazan: 'Lửa',
    };
    return names[resource] || resource;
  }
}
