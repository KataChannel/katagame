import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlayerService } from '../player/player.service';

@Injectable()
export class PvPShopService {
  constructor(
    private prisma: PrismaService,
    private playerService: PlayerService,
  ) {}

  // Local shop items definition (In a real app, this might be in DB)
  private readonly SHOP_ITEMS = [
    { id: 'shield_24h', name: 'Khiên Hộ Mệnh 24h', cost: 100, type: 'SHIELD', value: 24 },
    { id: 'gold_5000', name: '5,000 Vàng', cost: 50, type: 'RESOURCE', resource: 'gold', amount: 5000 },
    { id: 'rice_10000', name: '10,000 Lúa', cost: 50, type: 'RESOURCE', resource: 'rice', amount: 10000 },
    { id: 'stamina_potion', name: 'Bình Thể Lực', cost: 30, type: 'STAMINA', amount: 50 },
  ];

  async getShopItems() {
    return this.SHOP_ITEMS;
  }

  async buyItem(playerId: string, itemId: string) {
    const item = this.SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) throw new BadRequestException('Vật phẩm không tồn tại');

    const player = await this.prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new BadRequestException('Player not found');

    const reputation = (player as any).reputation || 0;
    if (reputation < item.cost) {
      throw new BadRequestException('Bạn không đủ Điểm Danh Vọng');
    }

    // Deduct reputation
    await this.prisma.player.update({
      where: { id: playerId },
      data: { reputation: { decrement: item.cost } } as any,
    });

    // Award item/effect
    if (item.type === 'SHIELD') {
      await this.playerService.buyShield(playerId, item.value as number);
    } else if (item.type === 'RESOURCE') {
      await this.playerService.addResources(playerId, { [item.resource as string]: item.amount });
    } else if (item.type === 'STAMINA') {
      await this.prisma.player.update({
        where: { id: playerId },
        data: { stamina: { increment: item.amount } },
      });
    }

    return {
      success: true,
      message: `Đã mua thành công ${item.name}!`,
      remainingReputation: reputation - item.cost,
    };
  }
}
