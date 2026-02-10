import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RelicService } from './relic.service';
import { Relic, PlayerRelic } from '../graphql/models/relic.model';

@Resolver()
export class RelicResolver {
  constructor(private relicService: RelicService) {}

  @Query(() => [Relic], { name: 'allRelics' })
  async getAllRelics(): Promise<Relic[]> {
    return this.relicService.getAllRelics();
  }

  @Query(() => [PlayerRelic], { name: 'myRelics' })
  @UseGuards(JwtAuthGuard)
  async getMyRelics(@CurrentUser() user: any): Promise<PlayerRelic[]> {
    return this.relicService.getPlayerRelics(user.id);
  }

  @Mutation(() => PlayerRelic, { name: 'craftRelic' })
  @UseGuards(JwtAuthGuard)
  async craftRelic(
    @CurrentUser() user: any,
    @Args('relicId') relicId: string,
  ): Promise<PlayerRelic> {
    return this.relicService.craftRelic(user.id, relicId);
  }

  @Mutation(() => PlayerRelic, { name: 'placeRelic' })
  @UseGuards(JwtAuthGuard)
  async placeRelic(
    @CurrentUser() user: any,
    @Args('playerRelicId') playerRelicId: string,
    @Args('provinceId', { type: () => Int }) provinceId: number,
  ): Promise<PlayerRelic> {
    return this.relicService.placeRelic(user.id, playerRelicId, provinceId);
  }
}
