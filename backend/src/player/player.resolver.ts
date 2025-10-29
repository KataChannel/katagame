import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
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
}
