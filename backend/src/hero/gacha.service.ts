import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlayerService } from '../player/player.service';

@Injectable()
export class GachaService {
  private readonly logger = new Logger(GachaService.name);

  constructor(
    private prisma: PrismaService,
    private playerService: PlayerService,
  ) {}

  // Gacha Rates (%)
  private readonly HERO_RATES = {
    legendary: 1,
    epic: 4,
    rare: 15,
    uncommon: 30,
    common: 50,
  };

  private readonly GACHA_COST = 100; // Gems per pull
  private readonly PITY_THRESHOLD = 80;

  /**
   * Pull from Hero Gacha
   */
  async pullHero(playerId: string, count: number = 1) {
    if (count < 1 || count > 10) {
      throw new BadRequestException('Can only pull between 1 and 10 at a time');
    }

    const totalCost = count * this.GACHA_COST;

    // Check resources
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { resources: true, hero_pity_count: true } as any,
    });

    if (!player) throw new Error('Player not found');

    const resources = player.resources as any;
    if ((resources.gems || 0) < totalCost) {
      throw new BadRequestException('Insufficient Gems');
    }

    // Spend resources
    await this.playerService.spendResources(playerId, { gems: totalCost });

    const results: any[] = [];
    let currentPity = (player as any).hero_pity_count || 0;

    for (let i = 0; i < count; i++) {
      currentPity++;
      let rarity = '';

      // Check Pity
      if (currentPity >= this.PITY_THRESHOLD) {
        rarity = 'legendary';
        currentPity = 0;
        this.logger.log(`🎰 PITY REACHED! Player ${playerId} got a guaranteed Legendary.`);
      } else {
        rarity = this.rollRarity(this.HERO_RATES);
        if (rarity === 'legendary') {
          currentPity = 0; // Reset pity on natural legendary
        }
      }

      // Pick a random hero of that rarity
      const hero = await this.getRandomHeroByRarity(rarity);
      if (!hero) {
        // Should not happen if data is seeded
        this.logger.error(`❌ No heroes found for rarity: ${rarity}`);
        continue;
      }
      
      // Add to player's collection
      // Check if player already has it
      const existing = await this.prisma.playerHero.findFirst({
        where: { player_id: playerId, hero_id: hero.id },
      });

      if (existing) {
        // Convert duplicate to resources (e.g., 500 gold)
        await this.playerService.addResources(playerId, { gold: 500 });
        results.push({
          hero,
          isDuplicate: true,
          reward: '500 Gold (Duplicate)',
        });
      } else {
        const playerHero = await this.prisma.playerHero.create({
          data: {
            player_id: playerId,
            hero_id: hero.id,
            level: 1,
            experience: 0,
            acquired_at: new Date(),
          },
          include: { hero: true },
        });
        results.push({
          hero: (playerHero as any).hero,
          playerHero,
          isDuplicate: false,
        });
      }
    }

    // Update pity count
    await this.prisma.player.update({
      where: { id: playerId },
      data: { hero_pity_count: currentPity } as any,
    });

    return {
      results,
      totalSpent: totalCost,
      newPityCount: currentPity,
    };
  }

  private rollRarity(rates: Record<string, number>): string {
    const roll = Math.random() * 100;
    let cumulative = 0;

    for (const [rarity, rate] of Object.entries(rates)) {
      cumulative += rate;
      if (roll <= cumulative) return rarity;
    }

    return 'common';
  }

  private async getRandomHeroByRarity(rarity: string) {
    const heroes = await this.prisma.hero.findMany({
      where: { rarity, is_available: true },
    });

    if (heroes.length === 0) {
      // Fallback if no heroes of that rarity exist
      return this.prisma.hero.findFirst({ where: { is_available: true } });
    }

    return heroes[Math.floor(Math.random() * heroes.length)];
  }
}
