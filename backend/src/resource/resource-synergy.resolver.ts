import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ResourceSynergyService } from './resource-synergy.service';
import {
  PlayerSynergies,
  WuXingCycleData,
  ProvinceSynergyInfo,
} from '../graphql/models/hero.model';

/**
 * ResourceSynergyResolver - MVP2 Sprint 4
 * GraphQL resolver for Wu Xing synergy system
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class ResourceSynergyResolver {
  constructor(
    private readonly synergyService: ResourceSynergyService,
  ) {}

  // ========================================
  // QUERIES
  // ========================================

  /**
   * Get player's active synergies
   */
  @Query(() => PlayerSynergies, { name: 'myResourceSynergies' })
  async getMyResourceSynergies(
    @CurrentUser() user: any,
  ): Promise<PlayerSynergies> {
    return this.synergyService.calculatePlayerSynergies(user.id);
  }

  /**
   * Get Wu Xing cycle visualization data
   */
  @Query(() => WuXingCycleData, { name: 'wuXingCycle' })
  async getWuXingCycle(
    @CurrentUser() user: any,
  ): Promise<WuXingCycleData> {
    return this.synergyService.getWuXingCycleData(user.id);
  }

  /**
   * Check synergy for specific province
   */
  @Query(() => ProvinceSynergyInfo, { name: 'provinceSynergy' })
  async getProvinceSynergy(
    @CurrentUser() user: any,
    @Args('provinceId', { type: () => Int }) provinceId: number,
  ): Promise<ProvinceSynergyInfo> {
    return this.synergyService.checkProvinceSynergy(user.id, provinceId);
  }
}
