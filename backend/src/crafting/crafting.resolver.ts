import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CraftingService } from './crafting.service';
import { Item, PlayerItem } from '../graphql/models/item.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
export class CraftingResolver {
  constructor(private craftingService: CraftingService) {}

  @Query(() => [Item])
  async craftableItems() {
    const items = await this.craftingService.getAllCraftableItems();
    return items.map(item => ({
      ...item,
      nameVietnamese: item.name_vietnamese,
      itemType: item.item_type,
      staminaRestore: item.stamina_restore,
      luckBonus: item.luck_bonus,
      baseBronzeCost: item.base_bronze_cost,
      baseRiceCost: item.base_rice_cost,
      baseWoodCost: item.base_wood_cost,
      isCraftable: item.is_craftable,
      createdAt: item.created_at,
    }));
  }

  @Query(() => [PlayerItem])
  @UseGuards(JwtAuthGuard)
  async myInventory(@CurrentUser() user: any) {
    const inventory = await this.craftingService.getPlayerInventory(user.id);
    return inventory.map(pi => ({
      ...pi,
      playerId: pi.player_id,
      itemId: pi.item_id,
      createdAt: pi.created_at,
      updatedAt: pi.updated_at,
      item: {
        ...pi.item,
        nameVietnamese: pi.item.name_vietnamese,
        itemType: pi.item.item_type,
        staminaRestore: pi.item.stamina_restore,
        luckBonus: pi.item.luck_bonus,
        baseBronzeCost: pi.item.base_bronze_cost,
        baseRiceCost: pi.item.base_rice_cost,
        baseWoodCost: pi.item.base_wood_cost,
        isCraftable: pi.item.is_craftable,
        createdAt: pi.item.created_at,
      }
    }));
  }

  @Mutation(() => PlayerItem)
  @UseGuards(JwtAuthGuard)
  async craftItem(
    @CurrentUser() user: any,
    @Args('itemId') itemId: string,
  ) {
    const pi = await this.craftingService.craftItem(user.id, itemId);
    return {
      ...pi,
      playerId: pi.player_id,
      itemId: pi.item_id,
      createdAt: pi.created_at,
      updatedAt: pi.updated_at,
      item: {
        ...pi.item,
        nameVietnamese: pi.item.name_vietnamese,
        itemType: pi.item.item_type,
        staminaRestore: pi.item.stamina_restore,
        luckBonus: pi.item.luck_bonus,
        baseBronzeCost: pi.item.base_bronze_cost,
        baseRiceCost: pi.item.base_rice_cost,
        baseWoodCost: pi.item.base_wood_cost,
        isCraftable: pi.item.is_craftable,
        createdAt: pi.item.created_at,
      }
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async useItem(
    @CurrentUser() user: any,
    @Args('itemId') itemId: string,
  ) {
    return this.craftingService.useItem(user.id, itemId);
  }
}
