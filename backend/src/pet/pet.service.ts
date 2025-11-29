import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PetService {
  private readonly logger = new Logger(PetService.name);

  constructor(private prisma: PrismaService) {}

  // ========================================
  // MVP2 SPRINT 3: PET SYSTEM
  // ========================================

  /**
   * Get all pets for a player
   */
  async getPlayerPets(playerId: string) {
    return this.prisma.pets.findMany({
      where: { player_id: playerId },
      orderBy: { acquired_at: 'desc' },
    });
  }

  /**
   * Get pet by ID
   */
  async getPetById(petId: string, playerId: string) {
    const pet = await this.prisma.pets.findUnique({
      where: { id: petId },
    });

    if (!pet || pet.player_id !== playerId) {
      throw new NotFoundException('Pet not found');
    }

    return pet;
  }

  /**
   * Calculate pet bonuses based on type and level
   * Each pet provides different bonuses
   */
  calculatePetBonuses(pet: any) {
    const level = pet.level || 1;
    const petType = pet.pet_type || 'generic';
    
    // Base bonuses by pet type
    const bonusConfigs = {
      'combat': {
        attack: 5 * level,
        defense: 3 * level,
        hp: 10 * level,
        icon: '⚔️',
        description: 'Tăng sức mạnh chiến đấu',
      },
      'resource': {
        goldBonus: 10 * level,
        riceBonus: 10 * level,
        productionSpeed: 5 * level,
        icon: '💰',
        description: 'Tăng sản xuất tài nguyên',
      },
      'experience': {
        expBonus: 15 * level,
        learningSpeed: 10 * level,
        icon: '📚',
        description: 'Tăng kinh nghiệm và học tập',
      },
      'luck': {
        luckBonus: 20 * level,
        criticalChance: 5 * level,
        icon: '🍀',
        description: 'Tăng may mắn và chí mạng',
      },
      'speed': {
        speed: 5 * level,
        buildingSpeed: 10 * level,
        icon: '⚡',
        description: 'Tăng tốc độ xây dựng',
      },
      'generic': {
        allStats: 3 * level,
        icon: '🐾',
        description: 'Tăng nhẹ tất cả chỉ số',
      },
    };

    return bonusConfigs[petType] || bonusConfigs['generic'];
  }

  /**
   * Assign pet to a hero
   * Pet provides bonuses to the hero
   */
  async assignPetToHero(playerId: string, petId: string, heroId: string) {
    this.logger.log(`🐾 Assign pet: Pet=${petId}, Hero=${heroId}, Player=${playerId}`);

    // Verify pet ownership
    const pet = await this.getPetById(petId, playerId);

    // Verify hero ownership
    const playerHero = await this.prisma.playerHero.findFirst({
      where: {
        player_id: playerId,
        hero_id: heroId,
      },
      include: { hero: true },
    });

    if (!playerHero) {
      throw new NotFoundException('Hero not found in your collection');
    }

    // Calculate pet bonuses
    const bonuses = this.calculatePetBonuses(pet);

    // Update player hero with pet info
    const updated = await this.prisma.playerHero.update({
      where: { id: playerHero.id },
      data: {
        pet_level: pet.level,
        pet_bonus_active: true,
      },
      include: { hero: true },
    });

    this.logger.log(`✅ Pet assigned successfully! Bonuses: ${JSON.stringify(bonuses)}`);

    return {
      playerHero: updated,
      pet,
      bonuses,
    };
  }

  /**
   * Unassign pet from hero
   */
  async unassignPetFromHero(playerId: string, heroId: string) {
    this.logger.log(`🐾 Unassign pet: Hero=${heroId}, Player=${playerId}`);

    const playerHero = await this.prisma.playerHero.findFirst({
      where: {
        player_id: playerId,
        hero_id: heroId,
      },
    });

    if (!playerHero) {
      throw new NotFoundException('Hero not found');
    }

    if (!playerHero.pet_bonus_active) {
      throw new BadRequestException('No pet assigned to this hero');
    }

    // Remove pet assignment
    const updated = await this.prisma.playerHero.update({
      where: { id: playerHero.id },
      data: {
        pet_level: 1,
        pet_bonus_active: false,
      },
      include: { hero: true },
    });

    this.logger.log(`✅ Pet unassigned successfully!`);

    return updated;
  }

  /**
   * Level up pet
   * Requires resources and increases pet bonuses
   */
  async levelUpPet(playerId: string, petId: string) {
    const pet = await this.getPetById(petId, playerId);

    const currentLevel = pet.level || 1;
    const maxLevel = 10;

    if (currentLevel >= maxLevel) {
      throw new BadRequestException(`Pet is already at max level (${maxLevel})`);
    }

    // Calculate level up cost
    const cost = this.calculatePetLevelUpCost(currentLevel);

    // Check if player has enough resources
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    const resources = (player?.resources as any) || {};
    const hasResources = this.checkResourcesAvailable(resources, cost);

    if (!hasResources) {
      throw new BadRequestException('Insufficient resources for pet level up');
    }

    // Level up pet
    const updated = await this.prisma.pets.update({
      where: { id: petId },
      data: {
        level: currentLevel + 1,
        experience: 0,
      },
    });

    // Deduct resources
    await this.deductPlayerResources(playerId, cost);

    this.logger.log(`✅ Pet leveled up! New level: ${updated.level}`);

    return updated;
  }

  /**
   * Grant experience to pet
   */
  async grantExpToPet(playerId: string, petId: string, expAmount: number) {
    const pet = await this.getPetById(petId, playerId);

    const currentLevel = pet.level || 1;
    const currentExp = pet.experience || 0;
    const maxLevel = 10;

    if (currentLevel >= maxLevel) {
      // Max level, no more exp
      return pet;
    }

    let newExp = currentExp + expAmount;
    let newLevel = currentLevel;

    // Check for level ups
    while (newLevel < maxLevel) {
      const requiredExp = this.getExpForNextPetLevel(newLevel);
      
      if (newExp >= requiredExp) {
        newExp -= requiredExp;
        newLevel++;
      } else {
        break;
      }
    }

    // Update pet
    const updated = await this.prisma.pets.update({
      where: { id: petId },
      data: {
        level: newLevel,
        experience: newExp,
      },
    });

    return {
      ...updated,
      leveledUp: newLevel > currentLevel,
      levelsGained: newLevel - currentLevel,
    };
  }

  /**
   * Get pet with bonuses
   */
  async getPetWithBonuses(petId: string, playerId: string) {
    const pet = await this.getPetById(petId, playerId);
    const bonuses = this.calculatePetBonuses(pet);
    const expForNextLevel = this.getExpForNextPetLevel(pet.level || 1);

    return {
      ...pet,
      bonuses,
      expForNextLevel,
      expProgress: expForNextLevel > 0 ? ((pet.experience || 0) / expForNextLevel) * 100 : 100,
    };
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  /**
   * Get exp required for next pet level
   */
  private getExpForNextPetLevel(currentLevel: number): number {
    if (currentLevel >= 10) return 0;
    
    // Exp requirement increases by 50 per level
    return 50 + (currentLevel - 1) * 50;
  }

  /**
   * Calculate pet level up cost
   */
  private calculatePetLevelUpCost(currentLevel: number) {
    const baseCost = 100;
    const multiplier = 1.5;

    const cost = Math.floor(baseCost * Math.pow(multiplier, currentLevel - 1));

    return {
      gold: cost,
      rice: Math.floor(cost * 0.5),
    };
  }

  /**
   * Check if player has resources
   */
  private checkResourcesAvailable(resources: any, costs: any): boolean {
    for (const [resourceType, amount] of Object.entries(costs)) {
      const required = amount as number;
      const available = (resources[resourceType] as number) || 0;
      
      if (available < required) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Deduct resources from player
   */
  private async deductPlayerResources(playerId: string, costs: any) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { resources: true },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    const currentResources = (player.resources as any) || {};
    const updatedResources = { ...currentResources };

    for (const [resourceType, amount] of Object.entries(costs)) {
      const deductAmount = amount as number;
      if (deductAmount > 0) {
        const currentAmount = (updatedResources[resourceType] as number) || 0;
        updatedResources[resourceType] = Math.max(0, currentAmount - deductAmount);
      }
    }

    await this.prisma.player.update({
      where: { id: playerId },
      data: { resources: updatedResources },
    });
  }
}
