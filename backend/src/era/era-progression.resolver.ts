import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { EraProgressionService } from './era-progression.service';
import {
  PlayerCurrentEra,
  EraTimeline,
} from '../graphql/models/hero.model';

/**
 * EraProgressionResolver - MVP2 Sprint 4
 * GraphQL resolver for historical era system
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class EraProgressionResolver {
  constructor(
    private readonly eraService: EraProgressionService,
  ) {}

  // ========================================
  // QUERIES
  // ========================================

  /**
   * Get player's current era
   */
  @Query(() => PlayerCurrentEra, { name: 'myCurrentEra' })
  async getMyCurrentEra(
    @CurrentUser() user: any,
  ): Promise<PlayerCurrentEra> {
    return this.eraService.getPlayerCurrentEra(user.sub);
  }

  /**
   * Get era timeline with progress
   */
  @Query(() => EraTimeline, { name: 'eraTimeline' })
  async getEraTimeline(
    @CurrentUser() user: any,
  ): Promise<EraTimeline> {
    return this.eraService.getEraTimeline(user.sub);
  }

  /**
   * Get era bonuses
   */
  @Query(() => Object, { name: 'myEraBonuses' })
  async getMyEraBonuses(
    @CurrentUser() user: any,
  ) {
    return this.eraService.calculateEraBonuses(user.sub);
  }

  /**
   * Get unlockable heroes from current era
   */
  @Query(() => Object, { name: 'unlockableHeroes' })
  async getUnlockableHeroes(
    @CurrentUser() user: any,
  ) {
    return this.eraService.getUnlockableHeroes(user.sub);
  }
}
