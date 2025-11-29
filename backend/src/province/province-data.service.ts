import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum ProvinceRegion {
  NORTH = 'Miền Bắc',
  CENTRAL = 'Miền Trung',
  SOUTH = 'Miền Nam',
}

export interface ProvinceMetadata {
  area_km2?: number;
  population?: number;
  capital_city?: string;
  famous_for?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

@Injectable()
export class ProvinceDataService {
  constructor(private readonly prisma: PrismaService) {}

  // Region mapping for 63 provinces
  private readonly regionMapping: Record<number, ProvinceRegion> = {
    // Miền Bắc (25 provinces)
    1: ProvinceRegion.NORTH, // Hà Nội
    2: ProvinceRegion.NORTH, // Hải Phòng
    3: ProvinceRegion.NORTH, // Quảng Ninh
    4: ProvinceRegion.NORTH, // Hải Dương
    5: ProvinceRegion.NORTH, // Hưng Yên
    6: ProvinceRegion.NORTH, // Bắc Ninh
    7: ProvinceRegion.NORTH, // Vĩnh Phúc
    8: ProvinceRegion.NORTH, // Thái Nguyên
    9: ProvinceRegion.NORTH, // Bắc Giang
    10: ProvinceRegion.NORTH, // Lạng Sơn
    11: ProvinceRegion.NORTH, // Cao Bằng
    12: ProvinceRegion.NORTH, // Hà Giang
    13: ProvinceRegion.NORTH, // Tuyên Quang
    14: ProvinceRegion.NORTH, // Phú Thọ
    15: ProvinceRegion.NORTH, // Yên Bái
    16: ProvinceRegion.NORTH, // Lào Cai
    17: ProvinceRegion.NORTH, // Điện Biên
    18: ProvinceRegion.NORTH, // Lai Châu
    19: ProvinceRegion.NORTH, // Sơn La
    20: ProvinceRegion.NORTH, // Hòa Bình
    21: ProvinceRegion.NORTH, // Nam Định
    22: ProvinceRegion.NORTH, // Thái Bình
    23: ProvinceRegion.NORTH, // Ninh Bình
    24: ProvinceRegion.NORTH, // Hà Nam
    25: ProvinceRegion.NORTH, // Bắc Kạn

    // Miền Trung (19 provinces)
    26: ProvinceRegion.CENTRAL, // Thanh Hóa
    27: ProvinceRegion.CENTRAL, // Nghệ An
    28: ProvinceRegion.CENTRAL, // Hà Tĩnh
    29: ProvinceRegion.CENTRAL, // Quảng Bình
    30: ProvinceRegion.CENTRAL, // Quảng Trị
    31: ProvinceRegion.CENTRAL, // Thừa Thiên Huế
    32: ProvinceRegion.CENTRAL, // Đà Nẵng
    33: ProvinceRegion.CENTRAL, // Quảng Nam
    34: ProvinceRegion.CENTRAL, // Quảng Ngãi
    35: ProvinceRegion.CENTRAL, // Bình Định
    36: ProvinceRegion.CENTRAL, // Phú Yên
    37: ProvinceRegion.CENTRAL, // Khánh Hòa
    38: ProvinceRegion.CENTRAL, // Ninh Thuận
    39: ProvinceRegion.CENTRAL, // Bình Thuận
    40: ProvinceRegion.CENTRAL, // Kon Tum
    41: ProvinceRegion.CENTRAL, // Gia Lai
    42: ProvinceRegion.CENTRAL, // Đắk Lắk
    43: ProvinceRegion.CENTRAL, // Đắk Nông
    44: ProvinceRegion.CENTRAL, // Lâm Đồng

    // Miền Nam (19 provinces)
    45: ProvinceRegion.SOUTH, // Bình Phước
    46: ProvinceRegion.SOUTH, // Bình Dương
    47: ProvinceRegion.SOUTH, // Đồng Nai
    48: ProvinceRegion.SOUTH, // Bà Rịa - Vũng Tàu
    49: ProvinceRegion.SOUTH, // TP. Hồ Chí Minh
    50: ProvinceRegion.SOUTH, // Tây Ninh
    51: ProvinceRegion.SOUTH, // Long An
    52: ProvinceRegion.SOUTH, // Tiền Giang
    53: ProvinceRegion.SOUTH, // Bến Tre
    54: ProvinceRegion.SOUTH, // Vĩnh Long
    55: ProvinceRegion.SOUTH, // Trà Vinh
    56: ProvinceRegion.SOUTH, // Đồng Tháp
    57: ProvinceRegion.SOUTH, // An Giang
    58: ProvinceRegion.SOUTH, // Kiên Giang
    59: ProvinceRegion.SOUTH, // Cần Thơ
    60: ProvinceRegion.SOUTH, // Hậu Giang
    61: ProvinceRegion.SOUTH, // Sóc Trăng
    62: ProvinceRegion.SOUTH, // Bạc Liêu
    63: ProvinceRegion.SOUTH, // Cà Mau
  };

  /**
   * Get all 63 provinces with enriched data
   */
  async getAllProvinces(playerId?: string) {
    const provinces = await this.prisma.province.findMany({
      orderBy: { id: 'asc' },
    });

    // If playerId provided, check ownership
    let playerProvinces: Array<{ province_id: number }> = [];
    if (playerId) {
      playerProvinces = await this.prisma.playerProvince.findMany({
        where: { player_id: playerId },
        select: { province_id: true },
      });
    }

    const ownedProvinceIds = new Set(
      playerProvinces.map((pp) => pp.province_id),
    );

    return provinces.map((province) => ({
      ...province,
      region: this.regionMapping[province.id] || ProvinceRegion.NORTH,
      isOwned: ownedProvinceIds.has(province.id),
      ownershipStatus: this.getOwnershipStatus(
        ownedProvinceIds.has(province.id),
        province.unlock_order,
      ),
    }));
  }

  /**
   * Get provinces by region (North/Central/South)
   */
  async getProvincesByRegion(region: ProvinceRegion, playerId?: string) {
    const provinceIds = Object.entries(this.regionMapping)
      .filter(([_, r]) => r === region)
      .map(([id]) => parseInt(id));

    const provinces = await this.prisma.province.findMany({
      where: { id: { in: provinceIds } },
      orderBy: { id: 'asc' },
    });

    // Check ownership
    let playerProvinces: Array<{ province_id: number }> = [];
    if (playerId) {
      playerProvinces = await this.prisma.playerProvince.findMany({
        where: {
          player_id: playerId,
          province_id: { in: provinceIds },
        },
        select: { province_id: true },
      });
    }

    const ownedProvinceIds = new Set(
      playerProvinces.map((pp) => pp.province_id),
    );

    return provinces.map((province) => ({
      ...province,
      region: this.regionMapping[province.id],
      isOwned: ownedProvinceIds.has(province.id),
      ownershipStatus: this.getOwnershipStatus(
        ownedProvinceIds.has(province.id),
        province.unlock_order,
      ),
    }));
  }

  /**
   * Search provinces by name (Vietnamese or English)
   */
  async searchProvinces(keyword: string, playerId?: string) {
    const provinces = await this.prisma.province.findMany({
      where: {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { name_english: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      orderBy: { id: 'asc' },
    });

    // Check ownership
    let playerProvinces: Array<{ province_id: number }> = [];
    if (playerId) {
      const provinceIds = provinces.map((p) => p.id);
      playerProvinces = await this.prisma.playerProvince.findMany({
        where: {
          player_id: playerId,
          province_id: { in: provinceIds },
        },
        select: { province_id: true },
      });
    }

    const ownedProvinceIds = new Set(
      playerProvinces.map((pp) => pp.province_id),
    );

    return provinces.map((province) => ({
      ...province,
      region: this.regionMapping[province.id] || ProvinceRegion.NORTH,
      isOwned: ownedProvinceIds.has(province.id),
      ownershipStatus: this.getOwnershipStatus(
        ownedProvinceIds.has(province.id),
        province.unlock_order,
      ),
    }));
  }

  /**
   * Get detailed info for specific province
   */
  async getProvinceDetails(provinceId: number, playerId?: string) {
    const province = await this.prisma.province.findUnique({
      where: { id: provinceId },
      include: {
        stories: {
          select: {
            id: true,
            title_vietnamese: true,
            day: true,
            is_available: true,
          },
          orderBy: { day: 'asc' },
        },
      },
    });

    if (!province) {
      throw new Error(`Province with ID ${provinceId} not found`);
    }

    // Check ownership and get player-specific data
    let playerProvince: any = null;
    let deployedHero: any = null;
    if (playerId) {
      playerProvince = await this.prisma.playerProvince.findUnique({
        where: {
          player_id_province_id: {
            player_id: playerId,
            province_id: provinceId,
          },
        },
        include: {
          hero: {
            select: {
              id: true,
              name_vietnamese: true,
              era: true,
              rarity: true,
              role: true,
              bonus_type: true,
              bonus_value: true,
            },
          },
        },
      });

      deployedHero = playerProvince?.hero || null;
    }

    // Calculate total production rates
    const productionRates = {
      gold: Number(province.base_gold_rate || 0),
      rice: Number(province.base_rice_rate || 0),
      wood: Number(province.base_wood_rate || 0),
      stone: Number(province.base_stone_rate || 0),
      bazan: Number(province.base_bazan_rate || 0),
    };

    // Apply hero bonuses if hero deployed
    if (deployedHero && deployedHero.bonus_type && deployedHero.bonus_value) {
      const bonusType = deployedHero.bonus_type.toLowerCase();
      if (bonusType.includes('gold')) {
        productionRates.gold += deployedHero.bonus_value;
      } else if (bonusType.includes('rice')) {
        productionRates.rice += deployedHero.bonus_value;
      } else if (bonusType.includes('wood')) {
        productionRates.wood += deployedHero.bonus_value;
      }
    }

    // Apply level bonuses from player province
    if (playerProvince) {
      const farmerMultiplier = 1 + (playerProvince.farmer_level - 1) * 0.1;
      const resourceMultiplier = 1 + (playerProvince.resource_level - 1) * 0.1;

      productionRates.gold *= farmerMultiplier;
      productionRates.rice *= resourceMultiplier;
      productionRates.wood *= resourceMultiplier;
      productionRates.stone *= resourceMultiplier;
      productionRates.bazan *= resourceMultiplier;
    }

    return {
      ...province,
      region: this.regionMapping[province.id] || ProvinceRegion.NORTH,
      isOwned: !!playerProvince,
      ownershipStatus: this.getOwnershipStatus(
        !!playerProvince,
        province.unlock_order,
      ),
      playerData: playerProvince
        ? {
            farmerLevel: playerProvince.farmer_level,
            resourceLevel: playerProvince.resource_level,
            developmentLevel: playerProvince.development_level,
            buildingsCount: playerProvince.buildings_count,
            passiveBuffs: playerProvince.passive_buffs || [],
            activeSkillLevel: playerProvince.active_skill_level || 0,
            deployedHero: deployedHero,
          }
        : null,
      productionRates: {
        gold: Math.floor(productionRates.gold),
        rice: Math.floor(productionRates.rice),
        wood: Math.floor(productionRates.wood),
        stone: Math.floor(productionRates.stone),
        bazan: Math.floor(productionRates.bazan),
      },
      stories: province.stories,
    };
  }

  /**
   * Get region statistics (total provinces, owned, available)
   */
  async getRegionStatistics(playerId?: string) {
    const allProvinces = await this.getAllProvinces(playerId);

    const statistics = {
      [ProvinceRegion.NORTH]: {
        total: 0,
        owned: 0,
        available: 0,
        locked: 0,
      },
      [ProvinceRegion.CENTRAL]: {
        total: 0,
        owned: 0,
        available: 0,
        locked: 0,
      },
      [ProvinceRegion.SOUTH]: {
        total: 0,
        owned: 0,
        available: 0,
        locked: 0,
      },
    };

    allProvinces.forEach((province) => {
      const region = province.region;
      statistics[region].total++;

      if (province.isOwned) {
        statistics[region].owned++;
      } else if (province.ownershipStatus === 'available') {
        statistics[region].available++;
      } else {
        statistics[region].locked++;
      }
    });

    return {
      regions: statistics,
      overall: {
        total: allProvinces.length,
        owned: allProvinces.filter((p) => p.isOwned).length,
        available: allProvinces.filter(
          (p) => p.ownershipStatus === 'available',
        ).length,
        locked: allProvinces.filter((p) => p.ownershipStatus === 'locked')
          .length,
      },
    };
  }

  /**
   * Get province unlock requirements
   */
  async getProvinceUnlockInfo(provinceId: number) {
    const province = await this.prisma.province.findUnique({
      where: { id: provinceId },
    });

    if (!province) {
      throw new Error(`Province with ID ${provinceId} not found`);
    }

    // Check story requirement
    let requiredStory: any = null;
    if (province.unlock_story_day && province.unlock_story_day > 0) {
      requiredStory = await this.prisma.story.findFirst({
        where: { day: province.unlock_story_day },
        select: {
          id: true,
          title_vietnamese: true,
          day: true,
        },
      });
    }

    return {
      provinceId: province.id,
      provinceName: province.name,
      unlockOrder: province.unlock_order,
      unlockStoryDay: province.unlock_story_day,
      requiredStory: requiredStory,
      isStartingProvince: province.unlock_order === 1,
      requirements: {
        storyCompletion: requiredStory
          ? `Complete story day ${province.unlock_story_day}`
          : 'No story required',
        unlockOrder: `Unlock order: ${province.unlock_order}`,
      },
    };
  }

  /**
   * Helper: Determine ownership status
   */
  private getOwnershipStatus(
    isOwned: boolean,
    unlockOrder: number | null,
  ): 'owned' | 'available' | 'locked' {
    if (isOwned) return 'owned';
    if (!unlockOrder || unlockOrder <= 2) return 'available'; // First 2 provinces always available
    return 'locked';
  }

  /**
   * Get total province count
   */
  async getTotalProvinceCount(): Promise<number> {
    return this.prisma.province.count();
  }

  /**
   * Get player's province ownership count
   */
  async getPlayerProvinceCount(playerId: string): Promise<number> {
    return this.prisma.playerProvince.count({
      where: { player_id: playerId },
    });
  }
}
