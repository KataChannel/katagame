import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CraftingService {
  private readonly logger = new Logger(CraftingService.name);

  constructor(private prisma: PrismaService) {}

  async getAllCraftableItems() {
    return (this.prisma as any).item.findMany({
      where: { is_craftable: true },
    });
  }

  async getPlayerInventory(playerId: string) {
    return (this.prisma as any).playerItem.findMany({
      where: { player_id: playerId },
      include: { item: true },
    });
  }

  async craftItem(playerId: string, itemId: string) {
    const item = await (this.prisma as any).item.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Item not found');
    if (!item.is_craftable) throw new BadRequestException('Item is not craftable');

    // Check resources
    const player = await this.prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new NotFoundException('Player not found');
    
    const resources = typeof player.resources === 'string' 
      ? JSON.parse(player.resources as string) 
      : (player.resources as any);

    const costs = {
      gold: item.base_bronze_cost || 0,
      rice: item.base_rice_cost || 0,
      lumber: item.base_wood_cost || 0,
    };

    if (
      (resources.gold || 0) < costs.gold ||
      (resources.rice || 0) < costs.rice ||
      (resources.lumber || 0) < costs.lumber
    ) {
      throw new BadRequestException('Không đủ tài nguyên để chế tác');
    }

    // Deduct resources
    const newResources = {
      ...resources,
      gold: (resources.gold || 0) - costs.gold,
      rice: (resources.rice || 0) - costs.rice,
      lumber: (resources.lumber || 0) - costs.lumber,
    };

    await this.prisma.$transaction(async (tx) => {
      await tx.player.update({
        where: { id: playerId },
        data: { resources: newResources },
      });

      // Upsert PlayerItem
      await (tx as any).playerItem.upsert({
        where: { 
          player_id_item_id: {
            player_id: playerId,
            item_id: itemId,
          }
        },
        update: {
          quantity: { increment: 1 }
        },
        create: {
          player_id: playerId,
          item_id: itemId,
          quantity: 1,
        },
      });
    });

    this.logger.log(`🛠️ Player ${playerId} crafted ${item.name_vietnamese}`);
    
    return (this.prisma as any).playerItem.findUnique({
      where: {
        player_id_item_id: {
          player_id: playerId,
          item_id: itemId,
        }
      },
      include: { item: true },
    });
  }

  async useItem(playerId: string, itemId: string) {
    const playerItem = await (this.prisma as any).playerItem.findUnique({
      where: {
        player_id_item_id: {
          player_id: playerId,
          item_id: itemId,
        }
      },
      include: { item: true },
    });

    if (!playerItem || playerItem.quantity <= 0) {
      throw new BadRequestException('Bạn không có vật phẩm này trong kho');
    }

    const item = playerItem.item;

    await (this.prisma as any).$transaction(async (tx: any) => {
      // Consume item
      if (playerItem.quantity === 1) {
        await tx.playerItem.delete({
          where: { id: playerItem.id },
        });
      } else {
        await tx.playerItem.update({
          where: { id: playerItem.id },
          data: { quantity: { decrement: 1 } },
        });
      }

      // Apply effects
      if (item.item_type === 'FOOD' && item.stamina_restore) {
        const player = await tx.player.findUnique({ where: { id: playerId } });
        if (!player) return;

        const currentStamina = (player as any).stamina || 0;
        const maxStamina = (player as any).max_stamina || 100;
        
        const newStamina = Math.min(
          currentStamina + item.stamina_restore,
          maxStamina
        );
        
        await tx.player.update({
          where: { id: playerId },
          data: { stamina: newStamina } as any,
        });
      }
    });

    this.logger.log(`🍱 Player ${playerId} used ${item.name_vietnamese}`);
    return true;
  }
}
