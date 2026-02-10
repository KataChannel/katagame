import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

// ============================================================================
// Province Data Types (Sprint 5)
// ============================================================================

@ObjectType()
export class ProvinceData {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  nameEnglish?: string;

  @Field()
  region: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Boolean, { nullable: true })
  isCapital?: boolean;

  @Field(() => Float, { nullable: true })
  baseGoldRate?: number;

  @Field(() => Float, { nullable: true })
  baseRiceRate?: number;

  @Field(() => Float, { nullable: true })
  baseWoodRate?: number;

  @Field(() => Float, { nullable: true })
  baseStoneRate?: number;

  @Field(() => Float, { nullable: true })
  baseBazanRate?: number;

  @Field(() => [String], { nullable: true })
  historicalEras?: string[];

  @Field(() => Int, { nullable: true })
  unlockOrder?: number;

  @Field(() => Int, { nullable: true })
  unlockStoryDay?: number;

  @Field(() => Boolean)
  isOwned: boolean;

  @Field()
  ownershipStatus: string; // 'owned' | 'available' | 'locked'
}

@ObjectType()
export class ProvincePlayerData {
  @Field(() => Int)
  farmerLevel: number;

  @Field(() => Int)
  resourceLevel: number;

  @Field(() => Int)
  developmentLevel: number;

  @Field(() => Int)
  buildingsCount: number;

  @Field(() => [String])
  passiveBuffs: string[];

  @Field(() => Int)
  activeSkillLevel: number;

  // Note: Use forwardRef pattern - deployedHero is simplified to avoid circular ref
  @Field(() => String, { nullable: true })
  deployedHeroId?: string;

  @Field(() => String, { nullable: true })
  deployedHeroName?: string;

  @Field(() => String, { nullable: true })
  deployedHeroEra?: string;

  @Field(() => String, { nullable: true })
  deployedHeroRarity?: string;
}

@ObjectType()
export class ProvinceProductionRates {
  @Field(() => Int)
  gold: number;

  @Field(() => Int)
  rice: number;

  @Field(() => Int)
  wood: number;

  @Field(() => Int)
  stone: number;

  @Field(() => Int)
  bazan: number;
}

@ObjectType()
export class StoryInfo {
  @Field(() => ID)
  id: string;

  @Field()
  titleVietnamese: string;

  @Field(() => Int)
  day: number;

  @Field(() => Boolean)
  isAvailable: boolean;
}

@ObjectType()
export class ProvinceDetails {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  nameEnglish?: string;

  @Field()
  region: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Boolean, { nullable: true })
  isCapital?: boolean;

  @Field(() => Float, { nullable: true })
  baseGoldRate?: number;

  @Field(() => Float, { nullable: true })
  baseRiceRate?: number;

  @Field(() => Float, { nullable: true })
  baseWoodRate?: number;

  @Field(() => Float, { nullable: true })
  baseStoneRate?: number;

  @Field(() => Float, { nullable: true })
  baseBazanRate?: number;

  @Field(() => [String], { nullable: true })
  historicalEras?: string[];

  @Field(() => Int, { nullable: true })
  unlockOrder?: number;

  @Field(() => Int, { nullable: true })
  unlockStoryDay?: number;

  @Field(() => Boolean)
  isOwned: boolean;

  @Field(() => String)
  ownershipStatus: string;

  @Field(() => ProvincePlayerData, { nullable: true })
  playerData?: ProvincePlayerData;

  @Field(() => ProvinceProductionRates)
  productionRates: ProvinceProductionRates;

  @Field(() => [StoryInfo])
  stories: StoryInfo[];
}

@ObjectType()
export class RegionStatistic {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  owned: number;

  @Field(() => Int)
  available: number;

  @Field(() => Int)
  locked: number;
}

@ObjectType()
export class RegionStatistics {
  @Field(() => RegionStatistic)
  north: RegionStatistic;

  @Field(() => RegionStatistic)
  central: RegionStatistic;

  @Field(() => RegionStatistic)
  south: RegionStatistic;

  @Field(() => RegionStatistic)
  overall: RegionStatistic;
}

@ObjectType()
export class ProvinceUnlockInfo {
  @Field(() => Int)
  provinceId: number;

  @Field()
  provinceName: string;

  @Field(() => Int, { nullable: true })
  unlockOrder?: number;

  @Field(() => Int, { nullable: true })
  unlockStoryDay?: number;

  @Field(() => StoryInfo, { nullable: true })
  requiredStory?: StoryInfo;

  @Field(() => Boolean)
  isStartingProvince: boolean;

  @Field(() => String)
  requirementsDescription: string;
}

// ============================================================================
// Hero Types (Existing)
// ============================================================================

@ObjectType()
export class Hero {
  @Field(() => ID)
  id: string;

  @Field()
  nameVietnamese: string;

  @Field(() => String, { nullable: true })
  nameEnglish?: string;

  @Field(() => String, { nullable: true })
  era?: string;

  @Field(() => String, { nullable: true })
  rarity?: string;

  @Field(() => String, { nullable: true })
  role?: string;

  @Field(() => Int, { nullable: true })
  baseHp?: number;

  @Field(() => Int, { nullable: true })
  baseAttack?: number;

  @Field(() => Int, { nullable: true })
  baseDefense?: number;

  @Field(() => Int, { nullable: true })
  baseSpeed?: number;

  @Field(() => String, { nullable: true })
  bonusType?: string;

  @Field(() => Int, { nullable: true })
  bonusValue?: number;

  @Field(() => String, { nullable: true })
  petName?: string;

  @Field(() => String, { nullable: true })
  petEmoji?: string;

  @Field(() => Int, { nullable: true })
  petBonus?: number;

  @Field(() => Int, { nullable: true })
  storyDay?: number;

  @Field(() => String, { nullable: true })
  unlockRequirement?: string;

  @Field(() => Boolean, { nullable: true })
  isAvailable?: boolean;

  @Field(() => Boolean, { nullable: true })
  isPremium?: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class PlayerHero {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  playerId: string;

  @Field(() => ID)
  heroId: string;

  @Field(() => Int, { nullable: true })
  level?: number;

  @Field(() => Int, { nullable: true })
  experience?: number;

  @Field(() => Int, { nullable: true })
  deployedTo?: number;

  @Field(() => Hero)
  hero: Hero;

  @Field(() => Date)
  acquiredAt: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

// ========================================
// MVP2 SPRINT 3: HERO STATS & PET TYPES
// ========================================

@ObjectType()
export class HeroStats {
  @Field(() => Int)
  hp: number;

  @Field(() => Int)
  attack: number;

  @Field(() => Int)
  defense: number;

  @Field(() => Int)
  speed: number;

  @Field(() => Int)
  level: number;

  @Field(() => Int, { nullable: true })
  baseHP?: number;

  @Field(() => Int, { nullable: true })
  baseAttack?: number;

  @Field(() => Int, { nullable: true })
  baseDefense?: number;

  @Field(() => Int, { nullable: true })
  baseSpeed?: number;
}

@ObjectType()
export class PlayerHeroWithStats extends PlayerHero {
  @Field(() => HeroStats)
  stats: HeroStats;

  @Field(() => Int)
  expForNextLevel: number;

  @Field(() => Int)
  expProgress: number;
}

@ObjectType()
export class GrantExpResult {
  @Field(() => PlayerHero)
  playerHero: PlayerHero;

  @Field(() => Boolean)
  leveledUp: boolean;

  @Field(() => Int)
  levelsGained: number;
}

@ObjectType()
export class Pet {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  playerId: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  petType?: string;

  @Field(() => String, { nullable: true })
  rarity?: string;

  @Field(() => Int, { nullable: true })
  level?: number;

  @Field(() => Int, { nullable: true })
  experience?: number;

  @Field(() => Date)
  acquiredAt: Date;
}

@ObjectType()
export class PetBonuses {
  @Field(() => Int, { nullable: true })
  attack?: number;

  @Field(() => Int, { nullable: true })
  defense?: number;

  @Field(() => Int, { nullable: true })
  hp?: number;

  @Field(() => Int, { nullable: true })
  goldBonus?: number;

  @Field(() => Int, { nullable: true })
  riceBonus?: number;

  @Field(() => Int, { nullable: true })
  productionSpeed?: number;

  @Field(() => Int, { nullable: true })
  expBonus?: number;

  @Field(() => Int, { nullable: true })
  learningSpeed?: number;

  @Field(() => Int, { nullable: true })
  luckBonus?: number;

  @Field(() => Int, { nullable: true })
  criticalChance?: number;

  @Field(() => Int, { nullable: true })
  speed?: number;

  @Field(() => Int, { nullable: true })
  buildingSpeed?: number;

  @Field(() => Int, { nullable: true })
  allStats?: number;

  @Field(() => String)
  icon: string;

  @Field(() => String)
  description: string;
}

@ObjectType()
export class PetWithBonuses extends Pet {
  @Field(() => PetBonuses)
  bonuses: PetBonuses;

  @Field(() => Int)
  expForNextLevel: number;

  @Field(() => Int)
  expProgress: number;
}

@ObjectType()
export class AssignPetResult {
  @Field(() => PlayerHero)
  playerHero: PlayerHero;

  @Field(() => Pet)
  pet: Pet;

  @Field(() => PetBonuses)
  bonuses: PetBonuses;
}

// ==================== MVP2 SPRINT 4: RESOURCE SYNERGY & ERA PROGRESSION ====================

/**
 * Wu Xing (Five Elements) synergy information
 */
@ObjectType()
export class ResourceSynergy {
  @Field(() => String)
  sourceResource: string;

  @Field(() => String)
  targetResource: string;

  @Field(() => String)
  sourceElement: string;

  @Field(() => String)
  targetElement: string;

  @Field(() => Int)
  bonusPercentage: number;

  @Field(() => Int)
  affectedProvinces: number;

  @Field(() => String)
  description: string;

  @Field(() => String)
  icon: string;
}

/**
 * Player's synergy status
 */
@ObjectType()
export class PlayerSynergies {
  @Field(() => String)
  playerId: string;

  @Field(() => Int)
  totalProvinces: number;

  @Field(() => [ResourceSynergy])
  activeSynergies: ResourceSynergy[];

  @Field(() => Int)
  totalBonusPercentage: number;

  @Field(() => Float)
  cycleCompletion: number;
}

/**
 * Wu Xing cycle node
 */
@ObjectType()
export class WuXingNode {
  @Field(() => String)
  element: string;

  @Field(() => String)
  elementName: string;

  @Field(() => String)
  emoji: string;

  @Field(() => String)
  resource: string;

  @Field(() => String)
  resourceNameVN: string;

  @Field(() => String)
  nextElement: string;

  @Field(() => String)
  nextResource: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Int)
  bonusPercentage: number;
}

/**
 * Wu Xing cycle data
 */
@ObjectType()
export class WuXingCycleData {
  @Field(() => String)
  playerId: string;

  @Field(() => [WuXingNode])
  cycleNodes: WuXingNode[];

  @Field(() => [ResourceSynergy])
  activeSynergies: ResourceSynergy[];

  @Field(() => Float)
  cycleCompletion: number;

  @Field(() => Int)
  totalBonus: number;

  @Field(() => String)
  description: string;
}

/**
 * Province synergy info - for checkProvinceSynergy query
 */
@ObjectType()
export class ProvinceSynergyInfo {
  @Field(() => Int)
  provinceId: number;

  @Field(() => String)
  provinceName: string;

  @Field(() => [String])
  primaryResources: string[];

  @Field(() => [ResourceSynergy])
  applicableSynergies: ResourceSynergy[];

  @Field(() => Int)
  totalBonus: number;

  @Field(() => Boolean)
  hasSynergy: boolean;
}

/**
 * Era benefits
 */
@ObjectType()
export class EraBenefits {
  @Field(() => Int)
  goldBonus: number;

  @Field(() => Int)
  riceBonus: number;

  @Field(() => Int)
  woodBonus: number;

  @Field(() => Int)
  stoneBonus: number;

  @Field(() => Int)
  expBonus: number;

  @Field(() => [String])
  unlockHeroes: string[];
}

/**
 * Era information
 */
@ObjectType()
export class EraInfo {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  nameEnglish: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  emoji: string;

  @Field(() => String)
  color: string;

  @Field(() => Int)
  minStories: number;

  @Field(() => Int)
  maxStories: number;

  @Field(() => EraBenefits)
  benefits: EraBenefits;

  @Field(() => [String])
  landmarks: string[];

  @Field(() => Boolean)
  isUnlocked: boolean;

  @Field(() => Boolean)
  isCurrent: boolean;

  @Field(() => Float)
  progressPercentage: number;

  @Field(() => Int)
  requiredStories: number;

  @Field(() => Int)
  remainingStories: number;
}

/**
 * Player's current era
 */
@ObjectType()
export class PlayerCurrentEra {
  @Field(() => String)
  playerId: string;

  @Field(() => String)
  currentEra: string;

  @Field(() => String)
  eraName: string;

  @Field(() => String)
  eraEmoji: string;

  @Field(() => Int)
  completedStories: number;

  @Field(() => EraBenefits)
  benefits: EraBenefits;

  @Field(() => Boolean)
  isMaxEra: boolean;
}

/**
 * Era timeline
 */
@ObjectType()
export class EraTimeline {
  @Field(() => String)
  playerId: string;

  @Field(() => Int)
  completedStories: number;

  @Field(() => [EraInfo])
  timeline: EraInfo[];

  @Field(() => Int)
  currentEraIndex: number;
}

/**
 * Era production bonuses
 */
@ObjectType()
export class EraProductionBonuses {
  @Field(() => Int)
  goldProduction: number;

  @Field(() => Int)
  riceProduction: number;

  @Field(() => Int)
  woodProduction: number;

  @Field(() => Int)
  stoneProduction: number;

  @Field(() => Int)
  experienceGain: number;
}

/**
 * Player era bonuses result
 */
@ObjectType()
export class PlayerEraBonuses {
  @Field(() => String)
  playerId: string;

  @Field(() => String)
  era: string;

  @Field(() => String)
  eraName: string;

  @Field(() => EraProductionBonuses)
  bonuses: EraProductionBonuses;

  @Field(() => String)
  description: string;
}

/**
 * Unlockable hero info
 */
@ObjectType()
export class UnlockableHeroInfo {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name_vietnamese: string;

  @Field(() => String, { nullable: true })
  era?: string | null;

  @Field(() => String, { nullable: true })
  rarity?: string | null;
}

/**
 * Unlockable heroes result
 */
@ObjectType()
export class UnlockableHeroesResult {
  @Field(() => String)
  playerId: string;

  @Field(() => String)
  currentEra: string;

  @Field(() => [UnlockableHeroInfo])
  unlockableHeroes: UnlockableHeroInfo[];

  @Field(() => Int)
  totalUnlocked: number;
}
