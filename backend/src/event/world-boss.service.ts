import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorldBossService {
  private readonly logger = new Logger(WorldBossService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get the current active World Boss
   */
  async getActiveBoss() {
    const now = new Date();
    let boss = await (this.prisma as any).worldBoss.findFirst({
      where: {
        status: 'active',
        starts_at: { lte: now },
        ends_at: { gte: now },
      },
      include: {
        contributions: {
          orderBy: { total_damage: 'desc' },
          take: 10,
          include: { player: { select: { username: true } } },
        },
      },
    });

    // If no active boss, spawn one for the demonstration
    if (!boss) {
      boss = await this.spawnBoss();
    }

    return boss;
  }

  /**
   * Attack the World Boss
   */
  async attackBoss(playerId: string, bossId: string, damage: number) {
    const boss = await (this.prisma as any).worldBoss.findUnique({ where: { id: bossId } });
    if (!boss || boss.status !== 'active') throw new Error('Boss not found or already defeated');

    const now = new Date();
    if (boss.ends_at < now) {
      await (this.prisma as any).worldBoss.update({ where: { id: bossId }, data: { status: 'expired' } });
      throw new Error('Boss encounter has ended');
    }

    // Record damage and update boss HP
    const currentHp = BigInt(boss.current_hp);
    const damageDone = BigInt(damage);
    const newHp = currentHp - damageDone > 0n ? currentHp - damageDone : 0n;

    return (this.prisma as any).$transaction(async (tx: any) => {
      // Update Boss HP
      const updatedBoss = await tx.worldBoss.update({
        where: { id: bossId },
        data: { 
          current_hp: newHp,
          status: newHp === 0n ? 'defeated' : 'active',
        },
      });

      // Upsert contribution
      await tx.worldBossContribution.upsert({
        where: { boss_id_player_id: { boss_id: bossId, player_id: playerId } },
        create: {
          boss_id: bossId,
          player_id: playerId,
          total_damage: damageDone,
          attempts: 1,
          last_attack_at: now,
        },
        update: {
          total_damage: { increment: damageDone },
          attempts: { increment: 1 },
          last_attack_at: now,
        },
      });

      return updatedBoss;
    });
  }

  private async spawnBoss() {
    this.logger.log('📢 Spawning a new World Boss: TÀ THẦN CỔ ĐẠI');
    
    const now = new Date();
    const endsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    return (this.prisma as any).worldBoss.create({
      data: {
        name: 'Tà Thần Cổ Đại (Ancient Evil)',
        era: 'Hồng Bàng',
        max_hp: 1000000000n, // 1 Billion HP
        current_hp: 1000000000n,
        starts_at: now,
        ends_at: endsAt,
        status: 'active',
      },
    });
  }
}
