import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { EraProgressionService } from './era-progression.service';
import {
  PlayerCurrentEra,
  EraTimeline,
  PlayerEraBonuses,
  UnlockableHeroesResult,
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
    return this.eraService.getPlayerCurrentEra(user.id);
  }

  /**
   * Get era timeline with progress
   */
  @Query(() => EraTimeline, { name: 'eraTimeline' })
  async getEraTimeline(
    @CurrentUser() user: any,
  ): Promise<EraTimeline> {
    return this.eraService.getEraTimeline(user.id);
  }

  /**
   * Get era bonuses
   */
  @Query(() => PlayerEraBonuses, { name: 'myEraBonuses' })
  async getMyEraBonuses(
    @CurrentUser() user: any,
  ): Promise<PlayerEraBonuses> {
    return this.eraService.calculateEraBonuses(user.id);
  }

  /**
   * Get unlockable heroes from current era
   */
  @Query(() => UnlockableHeroesResult, { name: 'unlockableHeroes' })
  async getUnlockableHeroes(
    @CurrentUser() user: any,
  ): Promise<UnlockableHeroesResult> {
    return this.eraService.getUnlockableHeroes(user.id);
  }
}
