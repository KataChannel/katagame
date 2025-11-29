import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { HeroService } from './hero.service';
import { 
  Hero, 
  PlayerHero,
  PlayerHeroWithStats,
  GrantExpResult,
} from '../graphql/models/hero.model';
import {
  HeroWhereInput,
  PlayerHeroWhereInput,
  RecruitHeroInput,
  DeployHeroInput,
  LevelUpHeroInput,
} from '../graphql/inputs/hero.input';
import { PaginationInput } from '../graphql/common/filters.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Hero)
export class HeroResolver {
  constructor(private heroService: HeroService) {}

  // Transform helpers
  private transformHero(hero: any): Hero {
    return {
      ...hero,
      nameVietnamese: hero.name_vietnamese,
      nameEnglish: hero.name_english ?? undefined,
      era: hero.era ?? undefined,
      rarity: hero.rarity ?? undefined,
      role: hero.role ?? undefined,
      baseHp: hero.base_hp ?? undefined,
      baseAttack: hero.base_attack ?? undefined,
      baseDefense: hero.base_defense ?? undefined,
      baseSpeed: hero.base_speed ?? undefined,
      bonusType: hero.bonus_type ?? undefined,
      bonusValue: hero.bonus_value ?? undefined,
      petName: hero.pet_name ?? undefined,
      petEmoji: hero.pet_emoji ?? undefined,
      petBonus: hero.pet_bonus ?? undefined,
      storyDay: hero.story_day ?? undefined,
      unlockRequirement: hero.unlock_requirement ?? undefined,
      isAvailable: hero.is_available ?? undefined,
      isPremium: hero.is_premium ?? undefined,
      createdAt: hero.created_at ?? new Date(),
      updatedAt: hero.updated_at ?? new Date(),
    };
  }

  private transformPlayerHero(ph: any): PlayerHero {
    return {
      ...ph,
      playerId: ph.player_id,
      heroId: ph.hero_id,
      level: ph.level ?? undefined,
      experience: ph.experience ?? undefined,
      deployedTo: ph.deployed_to ?? undefined,
      acquiredAt: ph.acquired_at ?? new Date(),
      createdAt: ph.created_at ?? new Date(),
      updatedAt: ph.updated_at ?? new Date(),
      hero: ph.hero ? this.transformHero(ph.hero) : undefined,
    };
  }

  // Get all heroes (public)
  @Query(() => [Hero])
  async heroes(
    @Args('where', { nullable: true }) where?: HeroWhereInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<Hero[]> {
    const { heroes } = await this.heroService.findAll(where, pagination?.skip, pagination?.take);
    return heroes.map(h => this.transformHero(h));
  }

  // Get hero by ID (public)
  @Query(() => Hero)
  async hero(@Args('id') id: string): Promise<Hero> {
    const hero = await this.heroService.findById(id);
    return this.transformHero(hero);
  }

  // Get player's heroes (authenticated)
  @Query(() => [PlayerHero])
  @UseGuards(JwtAuthGuard)
  async myHeroes(
    @CurrentUser() user: any,
    @Args('where', { nullable: true }) where?: PlayerHeroWhereInput,
  ): Promise<PlayerHero[]> {
    const heroes = await this.heroService.getPlayerHeroes(user.id, where);
    return heroes.map(h => this.transformPlayerHero(h));
  }

  // Get specific player hero (authenticated)
  @Query(() => PlayerHero, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async myHero(
    @CurrentUser() user: any,
    @Args('heroId') heroId: string,
  ): Promise<PlayerHero | null> {
    const hero = await this.heroService.getPlayerHero(user.id, heroId);
    return hero ? this.transformPlayerHero(hero) : null;
  }

  // Recruit hero mutation (authenticated)
  @Mutation(() => PlayerHero)
  @UseGuards(JwtAuthGuard)
  async recruitHero(
    @CurrentUser() user: any,
    @Args('input') input: RecruitHeroInput,
  ): Promise<PlayerHero> {
    const hero = await this.heroService.recruitHero(user.id, input);
    return this.transformPlayerHero(hero);
  }

  // Deploy hero mutation (authenticated)
  @Mutation(() => PlayerHero)
  @UseGuards(JwtAuthGuard)
  async deployHero(
    @CurrentUser() user: any,
    @Args('input') input: DeployHeroInput,
  ): Promise<PlayerHero> {
    const hero = await this.heroService.deployHero(user.id, input);
    return this.transformPlayerHero(hero);
  }

  // Level up hero mutation (authenticated)
  @Mutation(() => PlayerHero)
  @UseGuards(JwtAuthGuard)
  async levelUpHero(
    @CurrentUser() user: any,
    @Args('input') input: LevelUpHeroInput,
  ): Promise<PlayerHero> {
    const hero = await this.heroService.levelUpHero(user.id, input);
    return this.transformPlayerHero(hero);
  }

  // ========================================
  // MVP2 SPRINT 3: HERO STATS QUERIES & MUTATIONS
  // ========================================

  /**
   * Get hero with calculated stats
   */
  @Query(() => PlayerHeroWithStats, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async myHeroWithStats(
    @CurrentUser() user: any,
    @Args('heroId') heroId: string,
  ): Promise<PlayerHeroWithStats | null> {
    const result = await this.heroService.getPlayerHeroWithStats(user.id, heroId);
    
    if (!result) {
      return null;
    }

    return {
      ...this.transformPlayerHero(result),
      stats: result.stats,
      expForNextLevel: result.expForNextLevel,
      expProgress: result.expProgress,
    };
  }

  /**
   * Get all player heroes with stats
   */
  @Query(() => [PlayerHeroWithStats])
  @UseGuards(JwtAuthGuard)
  async myHeroesWithStats(
    @CurrentUser() user: any,
  ): Promise<PlayerHeroWithStats[]> {
    const heroes = await this.heroService.getPlayerHeroesWithStats(user.id);
    
    return heroes.map(hero => ({
      ...this.transformPlayerHero(hero),
      stats: hero.stats,
      expForNextLevel: hero.expForNextLevel,
      expProgress: hero.expProgress,
    }));
  }

  /**
   * Grant experience to hero
   * Auto-levels up if threshold reached
   */
  @Mutation(() => GrantExpResult)
  @UseGuards(JwtAuthGuard)
  async grantExpToHero(
    @CurrentUser() user: any,
    @Args('heroId') heroId: string,
    @Args('expAmount', { type: () => Int }) expAmount: number,
  ): Promise<GrantExpResult> {
    const result = await this.heroService.grantExpToHero(user.id, heroId, expAmount);
    
    return {
      playerHero: this.transformPlayerHero(result),
      leveledUp: result.leveledUp || false,
      levelsGained: result.levelsGained || 0,
    };
  }
}
