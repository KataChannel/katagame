import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WorldBossService } from './world-boss.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { GraphQLJSON } from 'graphql-type-json';

@Resolver()
export class WorldBossResolver {
  constructor(private worldBossService: WorldBossService) {}

  @Query(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  async getActiveWorldBoss() {
    const boss = await this.worldBossService.getActiveBoss();
    return JSON.parse(JSON.stringify(boss, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  async attackWorldBoss(
    @CurrentUser() user: any,
    @Args('bossId') bossId: string,
    @Args('damage', { type: () => Int }) damage: number,
  ) {
    const updated = await this.worldBossService.attackBoss(user.id, bossId, damage);
    return JSON.parse(JSON.stringify(updated, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  }
}
