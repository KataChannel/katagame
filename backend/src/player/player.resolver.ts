import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Player } from '../graphql/models/player.model';
import { AuthResponse, MutationResponse } from '../graphql/common/responses.type';
import { PlayerService } from './player.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PlayerWhereInput, PlayerUpdateInput } from '../graphql/inputs/player.input';
import { PaginationInput } from '../graphql/common/filters.input';

@Resolver(() => Player)
export class PlayerResolver {
  constructor(private playerService: PlayerService) {}

  // Helper to transform Prisma player to GraphQL Player
  private transformPlayer(player: any): Player {
    return {
      ...player,
      level: player.level ?? undefined,
      experience: player.experience ?? undefined,
      stamina: player.stamina ?? undefined,
      maxStamina: player.max_stamina ?? undefined,
      premiumPassActive: player.premium_pass_active ?? false,
      premiumExpiresAt: player.premium_expires_at ?? undefined,
      shieldExpiresAt: player.shield_expires_at ?? undefined,
      lastRewardClaim: player.last_reward_claim ?? undefined,
      reputation: player.reputation ?? 0,
      createdAt: player.created_at ?? undefined,
      updatedAt: player.updated_at ?? undefined,
    };
  }

  // ==================== AUTHENTICATION ====================

  @Mutation(() => AuthResponse)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('username') username: string,
  ): Promise<AuthResponse> {
    try {
      return await this.playerService.register(email, password, username);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<AuthResponse> {
    try {
      return await this.playerService.login(email, password);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => AuthResponse)
  async googleAuth(
    @Args('credential') credential: string,
  ): Promise<AuthResponse> {
    try {
      return await this.playerService.googleAuth(credential);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ==================== QUERIES ====================

  @Query(() => Player, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any): Promise<Player | null> {
    const player = await this.playerService.findById(user.id);
    return player ? this.transformPlayer(player) : null;
  }

  @Query(() => Player, { nullable: true })
  async player(@Args('id') id: string): Promise<Player | null> {
    const player = await this.playerService.findById(id);
    return player ? this.transformPlayer(player) : null;
  }

  @Query(() => [Player])
  async players(
    @Args('where', { nullable: true }) where?: PlayerWhereInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<Player[]> {
    const result = await this.playerService.findMany(
      where,
      pagination?.skip,
      pagination?.take,
    );
    return result.data.map(p => this.transformPlayer(p));
  }

  // ==================== MUTATIONS ====================

  @Mutation(() => Player)
  @UseGuards(JwtAuthGuard)
  async updatePlayer(
    @CurrentUser() user: any,
    @Args('data') data: PlayerUpdateInput,
  ): Promise<Player> {
    const player = await this.playerService.update(user.id, data);
    return this.transformPlayer(player);
  }

  @Mutation(() => MutationResponse)
  @UseGuards(JwtAuthGuard)
  async addResources(
    @CurrentUser() user: any,
    @Args('gold', { nullable: true, defaultValue: 0 }) gold: number,
    @Args('rice', { nullable: true, defaultValue: 0 }) rice: number,
    @Args('lumber', { nullable: true, defaultValue: 0 }) lumber: number,
    @Args('stone', { nullable: true, defaultValue: 0 }) stone: number,
    @Args('bazan', { nullable: true, defaultValue: 0 }) bazan: number,
  ): Promise<MutationResponse> {
    try {
      await this.playerService.addResources(user.id, {
        gold,
        rice,
        lumber,
        stone,
        bazan,
      });
      return { success: true, message: 'Resources added successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Mutation(() => MutationResponse)
  @UseGuards(JwtAuthGuard)
  async resetPlayerData(@CurrentUser() user: any): Promise<MutationResponse> {
    try {
      await this.playerService.resetPlayerData(user.id);
      return { 
        success: true, 
        message: 'Player data has been reset successfully. All progress deleted.' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to reset player data' 
      };
    }
  }

  // ==================== NEW WEEK 2 MUTATIONS ====================

  @Mutation(() => Player)
  @UseGuards(JwtAuthGuard)
  async buyShield(
    @CurrentUser() user: any,
    @Args('durationHours', { type: () => Int }) durationHours: number,
  ): Promise<Player> {
    const player = await this.playerService.buyShield(user.id, durationHours);
    return this.transformPlayer(player);
  }

  @Mutation(() => Player)
  @UseGuards(JwtAuthGuard)
  async buyMonthlyPass(@CurrentUser() user: any): Promise<Player> {
    const player = await this.playerService.buyMonthlyPass(user.id);
    return this.transformPlayer(player);
  }

  @Mutation(() => Player)
  @UseGuards(JwtAuthGuard)
  async claimMonthlyPassReward(@CurrentUser() user: any): Promise<Player> {
    const player = await this.playerService.claimMonthlyPassReward(user.id);
    return this.transformPlayer(player);
  }
}
