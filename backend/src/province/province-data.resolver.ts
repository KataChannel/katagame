import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ProvinceDataService, ProvinceRegion } from './province-data.service';
import {
  ProvinceData,
  ProvinceDetails,
  RegionStatistics,
  ProvinceUnlockInfo,
} from '../graphql/models/hero.model';

@Resolver()
@UseGuards(JwtAuthGuard)
export class ProvinceDataResolver {
  constructor(private readonly provinceDataService: ProvinceDataService) {}

  /**
   * Get all 63 provinces
   */
  @Query(() => [ProvinceData], {
    description: 'Get all 63 provinces with ownership status',
  })
  async allProvinces(
    @CurrentUser() user: { userId: string },
  ): Promise<any[]> {
    return this.provinceDataService.getAllProvinces(user.userId);
  }

  /**
   * Get provinces by region (North/Central/South)
   */
  @Query(() => [ProvinceData], {
    description: 'Get provinces filtered by region',
  })
  async provincesByRegion(
    @Args('region', { type: () => String }) region: string,
    @CurrentUser() user: { userId: string },
  ): Promise<any[]> {
    // Map input string to ProvinceRegion enum
    const regionMap: Record<string, ProvinceRegion> = {
      north: ProvinceRegion.NORTH,
      central: ProvinceRegion.CENTRAL,
      south: ProvinceRegion.SOUTH,
      'miền bắc': ProvinceRegion.NORTH,
      'miền trung': ProvinceRegion.CENTRAL,
      'miền nam': ProvinceRegion.SOUTH,
    };

    const normalizedRegion = region.toLowerCase();
    const provinceRegion = regionMap[normalizedRegion] || ProvinceRegion.NORTH;

    return this.provinceDataService.getProvincesByRegion(
      provinceRegion,
      user.userId,
    );
  }

  /**
   * Search provinces by keyword
   */
  @Query(() => [ProvinceData], {
    description: 'Search provinces by name or description',
  })
  async searchProvinces(
    @Args('keyword', { type: () => String }) keyword: string,
    @CurrentUser() user: { userId: string },
  ): Promise<any[]> {
    return this.provinceDataService.searchProvinces(keyword, user.userId);
  }

  /**
   * Get detailed info for specific province
   */
  @Query(() => ProvinceDetails, {
    description: 'Get full details for a specific province',
  })
  async provinceDetail(
    @Args('provinceId', { type: () => Int }) provinceId: number,
    @CurrentUser() user: { userId: string },
  ): Promise<any> {
    return this.provinceDataService.getProvinceDetails(provinceId, user.userId);
  }

  /**
   * Get region statistics
   */
  @Query(() => RegionStatistics, {
    description: 'Get statistics for each region',
  })
  async regionStatistics(
    @CurrentUser() user: { userId: string },
  ): Promise<any> {
    const stats = await this.provinceDataService.getRegionStatistics(
      user.userId,
    );
    return {
      north: stats.regions['Miền Bắc'],
      central: stats.regions['Miền Trung'],
      south: stats.regions['Miền Nam'],
      overall: stats.overall,
    };
  }

  /**
   * Get province unlock requirements
   */
  @Query(() => ProvinceUnlockInfo, {
    description: 'Get unlock requirements for a province',
  })
  async provinceUnlockInfo(
    @Args('provinceId', { type: () => Int }) provinceId: number,
  ): Promise<any> {
    const info = await this.provinceDataService.getProvinceUnlockInfo(
      provinceId,
    );
    return {
      ...info,
      requirementsDescription: `${info.requirements.storyCompletion}. ${info.requirements.unlockOrder}`,
    };
  }

  /**
   * Get total province count
   */
  @Query(() => Int, {
    description: 'Get total number of provinces',
  })
  async totalProvinceCount(): Promise<number> {
    return this.provinceDataService.getTotalProvinceCount();
  }

  /**
   * Get player's owned province count
   */
  @Query(() => Int, {
    description: "Get player's owned province count",
  })
  async myProvinceCount(@CurrentUser() user: { userId: string }): Promise<number> {
    return this.provinceDataService.getPlayerProvinceCount(user.userId);
  }
}
