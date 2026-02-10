import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Province {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  nameEnglish?: string;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
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

  @Field(() => Int, { nullable: true })
  unlockOrder?: number;

  @Field(() => Int, { nullable: true })
  unlockStoryDay?: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class PlayerProvince {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  playerId: string;

  @Field(() => Int)
  provinceId: number;

  @Field(() => Int, { nullable: true })
  farmerLevel?: number;

  @Field(() => Int, { nullable: true })
  resourceLevel?: number;

  @Field(() => Int, { nullable: true })
  developmentLevel?: number;

  @Field(() => Int, { nullable: true })
  buildingsCount?: number;

  @Field(() => Int, { nullable: true })
  spiralLayers?: number;

  @Field(() => ID, { nullable: true })
  heroId?: string;

  @Field(() => Province)
  province: Province;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

// ========================================
// MVP2 SPRINT 2: PROVINCE SKILLS TYPES
// ========================================

@ObjectType()
export class PassiveBuff {
  @Field()
  type: string;

  @Field(() => Int)
  value: number;

  @Field()
  description: string;

  @Field()
  source: string;

  @Field()
  icon: string;
}

@ObjectType()
export class ActiveSkill {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Int)
  multiplier: number;

  @Field(() => Int)
  duration_hours: number;

  @Field(() => Int)
  cooldown_hours: number;

  @Field()
  icon: string;
}

@ObjectType()
export class SkillCooldownStatus {
  @Field(() => Boolean)
  isOnCooldown: boolean;

  @Field(() => Int)
  remainingSeconds: number;

  @Field(() => Int, { nullable: true })
  remainingHours?: number;

  @Field(() => Boolean)
  canUse: boolean;
}

@ObjectType()
export class PlayerProvinceWithSkills extends PlayerProvince {
  @Field(() => [PassiveBuff])
  passiveBuffs: PassiveBuff[];

  @Field(() => ActiveSkill, { nullable: true })
  activeSkill?: ActiveSkill;

  @Field(() => SkillCooldownStatus, { nullable: true })
  skillCooldown?: SkillCooldownStatus;
}

@ObjectType()
export class UseActiveSkillResult {
  @Field(() => PlayerProvince)
  playerProvince: PlayerProvince;

  @Field(() => ActiveSkill)
  skill: ActiveSkill;

  @Field(() => Date)
  cooldownEnds: Date;

  @Field(() => Date)
  effectEnds: Date;
}
