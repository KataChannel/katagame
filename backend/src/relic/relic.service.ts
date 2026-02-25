import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Relic, PlayerRelic } from '../graphql/models/relic.model';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RelicService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getAllRelics(): Promise<Relic[]> {
    const cacheKey = 'relics:all';
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const relics = await this.prisma.relic.findMany();
    const result = relics.map(r => ({
      ...r,
      auraValue: Number(r.aura_value),
      baseBronzeCost: r.base_bronze_cost,
      baseBazanCost: r.base_bazan_cost,
      auraType: r.aura_type,
      auraRadius: r.aura_radius
    }));

    await this.redis.set(cacheKey, JSON.stringify(result), 3600); // 1 hour
    return result;
  }

  async getPlayerRelics(playerId: string): Promise<PlayerRelic[]> {
    const playerRelics = await this.prisma.playerRelic.findMany({
      where: { player_id: playerId },
      include: { relic: true },
    });

    return playerRelics.map(pr => ({
      id: pr.id,
      playerId: pr.player_id,
      relicId: pr.relic_id,
      provinceId: pr.province_id,
      placedAt: pr.placed_at,
      relic: {
        ...pr.relic,
        auraValue: Number(pr.relic.aura_value),
        baseBronzeCost: pr.relic.base_bronze_cost,
        baseBazanCost: pr.relic.base_bazan_cost,
        auraType: pr.relic.aura_type,
        auraRadius: pr.relic.aura_radius
      }
    }));
  }

  async craftRelic(playerId: string, relicId: string): Promise<PlayerRelic> {
    const relic = await this.prisma.relic.findUnique({
      where: { id: relicId }
    });

    if (!relic) {
      throw new NotFoundException('Relic not found');
    }

    // Check if player has the relic already
    const existing = await this.prisma.playerRelic.findUnique({
      where: {
        player_id_relic_id: {
          player_id: playerId,
          relic_id: relicId
        }
      }
    });

    if (existing) {
      throw new Error('You already own this relic');
    }

    // Cost validation would go here (omitted for now to focus on core logic)

    const playerRelic = await this.prisma.playerRelic.create({
      data: {
        player_id: playerId,
        relic_id: relicId
      },
      include: { relic: true }
    });

    return {
      id: playerRelic.id,
      playerId: playerRelic.player_id,
      relicId: playerRelic.relic_id,
      provinceId: playerRelic.province_id,
      placedAt: playerRelic.placed_at,
      relic: {
        ...playerRelic.relic,
        auraValue: Number(playerRelic.relic.aura_value),
        baseBronzeCost: playerRelic.relic.base_bronze_cost,
        baseBazanCost: playerRelic.relic.base_bazan_cost,
        auraType: playerRelic.relic.aura_type,
        auraRadius: playerRelic.relic.aura_radius
      }
    };
  }

  async placeRelic(playerId: string, playerRelicId: string, provinceId: number): Promise<PlayerRelic> {
    const pr = await this.prisma.playerRelic.findUnique({
      where: { id: playerRelicId }
    });

    if (!pr || pr.player_id !== playerId) {
      throw new NotFoundException('Player relic not found');
    }

    const updated = await this.prisma.playerRelic.update({
      where: { id: playerRelicId },
      data: {
        province_id: provinceId,
        placed_at: new Date()
      },
      include: { relic: true }
    });

    return {
      id: updated.id,
      playerId: updated.player_id,
      relicId: updated.relic_id,
      provinceId: updated.province_id,
      placedAt: updated.placed_at,
      relic: {
        ...updated.relic,
        auraValue: Number(updated.relic.aura_value),
        baseBronzeCost: updated.relic.base_bronze_cost,
        baseBazanCost: updated.relic.base_bazan_cost,
        auraType: updated.relic.aura_type,
        auraRadius: updated.relic.aura_radius
      }
    };
  }
}
