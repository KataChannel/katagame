import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PetService } from './pet.service';
import { 
  Pet, 
  PetWithBonuses,
  AssignPetResult,
} from '../graphql/models/hero.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Pet)
export class PetResolver {
  constructor(private petService: PetService) {}

  // Transform helper
  private transformPet(pet: any): Pet {
    return {
      ...pet,
      playerId: pet.player_id,
      petType: pet.pet_type ?? undefined,
      rarity: pet.rarity ?? undefined,
      level: pet.level ?? undefined,
      experience: pet.experience ?? undefined,
      acquiredAt: pet.acquired_at ?? new Date(),
    };
  }

  /**
   * Get all player pets
   */
  @Query(() => [Pet])
  @UseGuards(JwtAuthGuard)
  async myPets(
    @CurrentUser() user: any,
  ): Promise<Pet[]> {
    const pets = await this.petService.getPlayerPets(user.id);
    return pets.map(p => this.transformPet(p));
  }

  /**
   * Get pet by ID
   */
  @Query(() => Pet, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async myPet(
    @CurrentUser() user: any,
    @Args('petId') petId: string,
  ): Promise<Pet | null> {
    const pet = await this.petService.getPetById(petId, user.id);
    return pet ? this.transformPet(pet) : null;
  }

  /**
   * Get pet with calculated bonuses
   */
  @Query(() => PetWithBonuses, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async myPetWithBonuses(
    @CurrentUser() user: any,
    @Args('petId') petId: string,
  ): Promise<PetWithBonuses | null> {
    const result = await this.petService.getPetWithBonuses(petId, user.id);
    
    if (!result) {
      return null;
    }

    return {
      ...this.transformPet(result),
      bonuses: result.bonuses,
      expForNextLevel: result.expForNextLevel,
      expProgress: result.expProgress,
    };
  }

  /**
   * Assign pet to hero
   */
  @Mutation(() => AssignPetResult)
  @UseGuards(JwtAuthGuard)
  async assignPetToHero(
    @CurrentUser() user: any,
    @Args('petId') petId: string,
    @Args('heroId') heroId: string,
  ): Promise<AssignPetResult> {
    const result = await this.petService.assignPetToHero(user.id, petId, heroId);
    
    // Transform player hero with proper field mapping
    const playerHero = result.playerHero;
    const hero = playerHero.hero;
    
    return {
      playerHero: {
        id: playerHero.id || '',
        playerId: playerHero.player_id,
        heroId: playerHero.hero_id,
        level: playerHero.level ?? undefined,
        experience: playerHero.experience ?? undefined,
        deployedTo: playerHero.deployed_to ?? undefined,
        acquiredAt: playerHero.acquired_at ?? new Date(),
        createdAt: playerHero.created_at ?? new Date(),
        updatedAt: playerHero.updated_at ?? new Date(),
        hero: {
          id: hero.id,
          nameVietnamese: hero.name_vietnamese,
          nameEnglish: hero.name_english ?? undefined,
          era: hero.era ?? undefined,
          rarity: hero.rarity ?? undefined,
          role: hero.role ?? undefined,
          baseHp: hero.base_hp ?? undefined,
          baseAttack: hero.base_attack ?? undefined,
          baseDefense: hero.base_defense ?? undefined,
          baseSpeed: hero.base_speed ?? undefined,
          bonusType: hero.bonus_type ?? undefined,
          bonusValue: hero.bonus_value ?? undefined,
          petName: hero.pet_name ?? undefined,
          petEmoji: hero.pet_emoji ?? undefined,
          petBonus: hero.pet_bonus ?? undefined,
          storyDay: hero.story_day ?? undefined,
          unlockRequirement: hero.unlock_requirement ?? undefined,
          isAvailable: hero.is_available ?? undefined,
          isPremium: hero.is_premium ?? undefined,
          createdAt: hero.created_at ?? new Date(),
          updatedAt: hero.updated_at ?? new Date(),
        },
      },
      pet: this.transformPet(result.pet),
      bonuses: result.bonuses,
    };
  }

  /**
   * Unassign pet from hero
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async unassignPetFromHero(
    @CurrentUser() user: any,
    @Args('heroId') heroId: string,
  ): Promise<boolean> {
    await this.petService.unassignPetFromHero(user.id, heroId);
    return true;
  }

  /**
   * Level up pet
   */
  @Mutation(() => Pet)
  @UseGuards(JwtAuthGuard)
  async levelUpPet(
    @CurrentUser() user: any,
    @Args('petId') petId: string,
  ): Promise<Pet> {
    const pet = await this.petService.levelUpPet(user.id, petId);
    return this.transformPet(pet);
  }

  /**
   * Grant experience to pet
   */
  @Mutation(() => Pet)
  @UseGuards(JwtAuthGuard)
  async grantExpToPet(
    @CurrentUser() user: any,
    @Args('petId') petId: string,
    @Args('expAmount', { type: () => Int }) expAmount: number,
  ): Promise<Pet> {
    const result = await this.petService.grantExpToPet(user.id, petId, expAmount);
    return this.transformPet(result);
  }
}
