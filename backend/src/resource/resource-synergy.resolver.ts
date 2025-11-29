import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ResourceSynergyService } from './resource-synergy.service';
import {
  PlayerSynergies,
  WuXingCycleData,
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
    return this.synergyService.calculatePlayerSynergies(user.sub);
  }

  /**
   * Get Wu Xing cycle visualization data
   */
  @Query(() => WuXingCycleData, { name: 'wuXingCycle' })
  async getWuXingCycle(
    @CurrentUser() user: any,
  ): Promise<WuXingCycleData> {
    return this.synergyService.getWuXingCycleData(user.sub);
  }

  /**
   * Check synergy for specific province
   */
  @Query(() => Object, { name: 'provinceSynergy' })
  async getProvinceSynergy(
    @CurrentUser() user: any,
    @Args('provinceId', { type: () => Number }) provinceId: number,
  ) {
    return this.synergyService.checkProvinceSynergy(user.sub, provinceId);
  }
}
