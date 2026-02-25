import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PvPService } from './pvp.service';
import { PvPShopService } from './pvp-shop.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { GraphQLJSON } from 'graphql-type-json';
import { Player } from '../graphql/models/player.model';

@ObjectType()
class Opponent extends Player {
  @Field(() => Int)
  combatPower: number;
}

@ObjectType()
class RaidResult {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => GraphQLJSON, { nullable: true })
  loot?: any;

  @Field(() => Int)
  attackerCp: number;

  @Field(() => Int)
  defenderCp: number;
}

@Resolver()
export class PvPResolver {
  constructor(
    private pvpService: PvPService,
    private pvpShopService: PvPShopService,
  ) {}

  @Query(() => [Opponent])
  @UseGuards(JwtAuthGuard)
  async getPvPOpponents(@CurrentUser() user: any): Promise<Opponent[]> {
    const ops = await this.pvpService.getOpponents(user.id);
    return ops.map(op => ({
      ...op,
      // Mapping fields if necessary, though Opponent extends Player
    })) as any;
  }

  @Mutation(() => RaidResult)
  @UseGuards(JwtAuthGuard)
  async raidOpponent(
    @CurrentUser() user: any,
    @Args('defenderId') defenderId: string,
  ): Promise<RaidResult> {
    return this.pvpService.raidOpponent(user.id, defenderId);
  }

  // ==================== PVP SHOP ====================

  @Query(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  async getPvPShopItems() {
    return this.pvpShopService.getShopItems();
  }

  @Mutation(() => GraphQLJSON)
  @UseGuards(JwtAuthGuard)
  async buyPvPShopItem(
    @CurrentUser() user: any,
    @Args('itemId') itemId: string,
  ) {
    return this.pvpShopService.buyItem(user.id, itemId);
  }
}
