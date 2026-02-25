import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlayerService } from '../player/player.service';

@Injectable()
export class PvPService {
  private readonly logger = new Logger(PvPService.name);

  constructor(
    private prisma: PrismaService,
    private playerService: PlayerService,
  ) {}

  private readonly DAILY_RAID_LIMIT = 10;
  private readonly RAID_LOOT_PERCENT = 0.1; // 10%

  /**
   * Search for potential opponents
   */
  async getOpponents(attackerId: string) {
    return this.playerService.findRandomOpponents(attackerId);
  }

  /**
   * Execute a raid on an opponent
   */
  async raidOpponent(attackerId: string, defenderId: string) {
    // 1. Validations
    const attacker = await this.prisma.player.findUnique({ where: { id: attackerId } });
    const defender = await this.prisma.player.findUnique({ where: { id: defenderId } });

    if (!attacker || !defender) throw new BadRequestException('Player not found');
    
    // Check daily limit
    const now = new Date();
    let raidCount = (attacker as any).daily_raid_count || 0;
    if ((attacker as any).last_raid_at && new Date((attacker as any).last_raid_at).toDateString() !== now.toDateString()) {
      raidCount = 0; // Reset daily
    }

    if (raidCount >= this.DAILY_RAID_LIMIT) {
      throw new BadRequestException(`Bạn đã hết lượt chinh phạt trong ngày (Max ${this.DAILY_RAID_LIMIT})`);
    }

    // Check shield
    if ((defender as any).shield_expires_at && new Date((defender as any).shield_expires_at) > now) {
      throw new BadRequestException('Đối thủ đang được bảo vệ bởi Khiên Hộ Mệnh');
    }

    // 2. Battle Simulation (Simple CP comparison with luck)
    const attackerCp = await this.playerService.calculateCombatPower(attackerId);
    const defenderCp = await this.playerService.calculateCombatPower(defenderId);

    const luckFactor = 0.8 + Math.random() * 0.4; // 80% to 120%
    const win = (attackerCp * luckFactor) > defenderCp;

    this.logger.log(`⚔️ PvP Raid: Attacker(${attackerCp}) vs Defender(${defenderCp}) - Result: ${win ? 'WIN' : 'LOSS'}`);

    if (!win) {
      // Update attacker stats even on loss
      await this.prisma.player.update({
        where: { id: attackerId },
        data: {
          daily_raid_count: raidCount + 1,
          last_raid_at: now,
        } as any,
      });

      return {
        success: false,
        message: 'Bạn đã thất bại trong cuộc chinh phạt!',
        attackerCp,
        defenderCp,
      };
    }

    // 3. Loot Logic
    const defenderResources = defender.resources as any;
    const loot: any = {};
    const resourcesToLoot = ['gold', 'rice', 'stone', 'lumber', 'bazan'];

    resourcesToLoot.forEach(res => {
      const amount = Math.floor((defenderResources[res] || 0) * this.RAID_LOOT_PERCENT);
      if (amount > 0) {
        loot[res] = amount;
      }
    });

    // 4. Update Database (Transfer resources + Award Reputation)
    await this.prisma.$transaction(async (tx) => {
      // Attacker gets loot
      await this.playerService.addResources(attackerId, loot);
      // Defender loses loot
      await this.playerService.spendResources(defenderId, loot);
      
      const reputationGain = 10;

      // Update attacker raid count and reputation
      await tx.player.update({
        where: { id: attackerId },
        data: {
          daily_raid_count: raidCount + 1,
          last_raid_at: now,
          reputation: { increment: reputationGain },
        } as any,
      });
    });

    return {
      success: true,
      message: `Chinh phạt thành công! Bạn đã thu được tài nguyên và 10 Điểm Danh Vọng.`,
      loot,
      attackerCp,
      defenderCp,
    };
  }
}
