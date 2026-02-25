import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayerService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Register new player
   */
  async register(email: string, password: string, username: string) {
    // Check if user exists
    const existingPlayer = await this.prisma.player.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingPlayer) {
      throw new Error('Email or username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create player with default resources
    const player = await this.prisma.player.create({
      data: {
        email,
        username,
        password_hash: passwordHash,
        level: 1,
        experience: 0,
        resources: {
          gold: 1000,
          rice: 1000,
          lumber: 500,
          stone: 500,
          bazan: 100,
          gems: 1500,
          culture: 100,
        },
        status: 'active',
        region: 'global',
      },
    });

    // Auto-unlock first 2 provinces (Hà Nội and Hồ Chí Minh)
    await this.prisma.playerProvince.createMany({
      data: [
        {
          player_id: player.id,
          province_id: 1, // Hà Nội
          farmer_level: 1,
          resource_level: 1,
          development_level: 1,
        },
        {
          player_id: player.id,
          province_id: 2, // Hải Phòng
          farmer_level: 1,
          resource_level: 1,
          development_level: 1,
        },
      ],
    });

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: player.id,
      email: player.email,
      username: player.username,
    });

    return {
      success: true,
      token,
      playerId: player.id,
      username: player.username,
      level: player.level ?? 1,
    };
  }

  /**
   * Login player
   */
  async login(email: string, password: string) {
    // Find player
    const player = await this.prisma.player.findUnique({
      where: { email },
    });

    if (!player) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, player.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await this.prisma.player.update({
      where: { id: player.id },
      data: { last_login: new Date() },
    });

    // Generate token
    const token = this.jwtService.sign({
      sub: player.id,
      email: player.email,
      username: player.username,
    });

    return {
      success: true,
      token,
      playerId: player.id,
      username: player.username,
      level: player.level ?? 1,
    };
  }

  /**
   * Google OAuth authentication
   */
  async googleAuth(credential: string) {
    try {
      // Decode Google JWT token (in production, verify with Google API)
      // Extract email from the credential
      const parts = credential.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid Google credential format');
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Add padding if needed
      const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      
      // Decode base64 to JSON string
      const jsonPayload = Buffer.from(paddedBase64, 'base64').toString('utf8');
      
      const googleData = JSON.parse(jsonPayload);
      const email = googleData.email;
      const name = googleData.name || googleData.email?.split('@')[0] || 'user';

      if (!email) {
        throw new Error('Email not found in Google credential');
      }

      // Check if player exists
      let player = await this.prisma.player.findUnique({
        where: { email },
      });

      // If player doesn't exist, create one
      if (!player) {
        player = await this.prisma.player.create({
          data: {
            email,
            username: name.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now(),
            password_hash: await bcrypt.hash(Math.random().toString(36), 10), // Random password
            level: 1,
            experience: 0,
            resources: {
              gold: 1000,
              rice: 1000,
              lumber: 500,
              stone: 500,
              bazan: 100,
              gems: 1500,
              culture: 100,
            },
            status: 'active',
            region: 'global',
          },
        });

        // Auto-unlock first 2 provinces for new Google users
        await this.prisma.playerProvince.createMany({
          data: [
            {
              player_id: player.id,
              province_id: 1, // Hà Nội
              farmer_level: 1,
              resource_level: 1,
              development_level: 1,
            },
            {
              player_id: player.id,
              province_id: 2, // Hồ Chí Minh
              farmer_level: 1,
              resource_level: 1,
              development_level: 1,
            },
          ],
        });
      }

      // Update last login
      await this.prisma.player.update({
        where: { id: player.id },
        data: { last_login: new Date() },
      });

      // Generate JWT token
      const token = this.jwtService.sign({
        sub: player.id,
        email: player.email,
        username: player.username,
      });

      return {
        success: true,
        token,
        playerId: player.id,
        username: player.username,
        level: player.level ?? 1,
      };
    } catch (error) {
      throw new Error(`Google authentication failed: ${error.message}`);
    }
  }

  /**
   * Get player by ID
   */
  async findById(id: string) {
    return this.prisma.player.findUnique({
      where: { id },
      include: {
        player_heroes: {
          include: {
            hero: true,
          },
        },
        player_provinces: {
          include: {
            province: true,
          },
        },
        player_resources: true,
      },
    });
  }

  /**
   * Get player with filters (Prisma-like)
   */
  async findMany(where?: any, skip: number = 0, take: number = 10) {
    const players = await this.prisma.player.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
    });

    const total = await this.prisma.player.count({ where });

    return {
      data: players,
      total,
      hasMore: skip + take < total,
    };
  }

  /**
   * Update player
   */
  async update(id: string, data: any) {
    return this.prisma.player.update({
      where: { id },
      data,
    });
  }

  /**
   * Calculate player's total storage capacity
   * Base cap + Bonuses from provinces resource/farmer levels
   */
  async calculateStorageCap(playerId: string) {
    const playerProvinces = await this.prisma.playerProvince.findMany({
      where: { player_id: playerId },
    });

    let totalCap = 5000; // Base starting cap for all resources
    
    playerProvinces.forEach(pp => {
      // Each resource_level adds 1000 storage
      // Each farmer_level adds 500 storage
      totalCap += ((pp.resource_level || 1) - 1) * 1000;
      totalCap += ((pp.farmer_level || 1) - 1) * 500;
    });

    return totalCap;
  }

  /**
   * Add resources to player (Honors Storage Cap)
   */
  async addResources(playerId: string, resources: any) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      throw new Error('Player not found');
    }

    const storageCap = await this.calculateStorageCap(playerId);
    const currentResources = player.resources as any || {};
    const updatedResources = { ...currentResources };

    for (const [key, value] of Object.entries(resources)) {
      if (key === 'gems' || key === 'culture') {
        // Premium currency and culture usually don't have a cap
        updatedResources[key] = (updatedResources[key] || 0) + Number(value);
        continue;
      }

      const newValue = (updatedResources[key] || 0) + Number(value);
      
      // Enforce storage cap
      if (newValue > storageCap) {
        updatedResources[key] = storageCap;
        console.log(`⚠️  Storage Cap reached for ${key}: ${newValue} capped at ${storageCap}`);
      } else {
        updatedResources[key] = newValue;
      }
    }

    return this.prisma.player.update({
      where: { id: playerId },
      data: { resources: updatedResources },
    });
  }

  /**
   * Spend resources from player
   */
  async spendResources(playerId: string, resources: any) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      throw new Error('Player not found');
    }

    const currentResources = player.resources as any || {};

    // Check if player has enough resources
    for (const [key, value] of Object.entries(resources)) {
      if ((currentResources[key] || 0) < Number(value)) {
        throw new Error(`Insufficient ${key}`);
      }
    }

    const updatedResources = { ...currentResources };
    for (const [key, value] of Object.entries(resources)) {
      updatedResources[key] -= Number(value);
    }

    return this.prisma.player.update({
      where: { id: playerId },
      data: { resources: updatedResources },
    });
  }

  /**
   * Reset player data (DELETE ALL PROGRESS)
   * WARNING: This will permanently delete all player progress!
   * - Deletes all player_provinces
   * - Deletes all player_heroes  
   * - Resets resources to initial values
   * - Resets level to 1
   * - Resets experience to 0
   * - Keeps account but deletes all game progress
   */
  async resetPlayerData(playerId: string) {
    // Verify player exists
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      throw new Error('Player not found');
    }

    console.log(`🔥 Resetting player data for: ${player.username} (${playerId})`);

    // Use transaction to ensure all operations succeed or fail together
    return this.prisma.$transaction(async (tx) => {
      // 1. Delete all player_provinces
      const deletedProvinces = await tx.playerProvince.deleteMany({
        where: { player_id: playerId },
      });
      console.log(`  ✅ Deleted ${deletedProvinces.count} provinces`);

      // 2. Delete all player_heroes
      const deletedHeroes = await tx.playerHero.deleteMany({
        where: { player_id: playerId },
      });
      console.log(`  ✅ Deleted ${deletedHeroes.count} heroes`);

      // 3. Delete all quiz submissions (if table exists)
      try {
        const deletedQuizzes = await tx.quizSubmission.deleteMany({
          where: { player_id: playerId },
        });
        console.log(`  ✅ Deleted ${deletedQuizzes.count} quiz submissions`);
      } catch (error) {
        console.log(`  ⚠️ Quiz submissions: ${error.message}`);
      }

      // Note: PlayerStory table may not exist yet, skip for now

      // 4. Reset player to initial state
      const initialResources = {
        gold: 1000,
        rice: 1000,
        lumber: 500,
        stone: 500,
        bazan: 100,
        gems: 1500,
        culture: 100,
      };

      const resetPlayer = await tx.player.update({
        where: { id: playerId },
        data: {
          level: 1,
          experience: 0,
          resources: initialResources,
        },
      });

      console.log(`  ✅ Player reset to level 1 with initial resources`);

      // 5. Auto-unlock first 2 provinces (Hà Nội and Hồ Chí Minh)
      // Same as register() to ensure player can start playing immediately
      await tx.playerProvince.createMany({
        data: [
          {
            player_id: playerId,
            province_id: 1, // Hà Nội
            farmer_level: 1,
            resource_level: 1,
            development_level: 1,
          },
          {
            player_id: playerId,
            province_id: 2, // Hồ Chí Minh
            farmer_level: 1,
            resource_level: 1,
            development_level: 1,
          },
        ],
      });

      console.log(`  ✅ Auto-unlocked 2 starter provinces (Hà Nội, Hồ Chí Minh)`);
      console.log(`🎉 Player data reset complete for: ${player.username}`);

      return resetPlayer;
    });
  }

  /**
   * Calculate total Combat Power (CP) for a player
   * CP = (Level * 100) + Sum(Hero HP/10 + Attack + Defense + Speed)
   */
  async calculateCombatPower(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { player_heroes: { include: { hero: true } } },
    });

    if (!player) return 0;

    let totalCp = (player.level || 1) * 100;

    // We can't easily import HeroService here without circular dependency 
    // since HeroModule likely imports PlayerModule.
    // Let's implement a simple version here or use raw stats.
    player.player_heroes.forEach((ph: any) => {
      const hero = ph.hero;
      if (!hero) return;
      
      const levelMultiplier = 1 + ((ph.level || 1) - 1) * 0.2;
      const hp = (hero.base_hp || 100) * levelMultiplier;
      const attack = (hero.base_attack || 10) * levelMultiplier;
      const defense = (hero.base_defense || 5) * levelMultiplier;
      const speed = (hero.base_speed || 8) * levelMultiplier;

      totalCp += Math.floor(hp / 10 + attack + defense + speed);
    });

    return totalCp;
  }

  /**
   * Find random opponents for PvP Raiding
   * Filters out players with active shields and the attacker themselves
   */
  async findRandomOpponents(attackerId: string, limit: number = 3) {
    const players = await this.prisma.player.findMany({
      where: {
        id: { not: attackerId },
        OR: [
          { shield_expires_at: null } as any,
          { shield_expires_at: { lt: new Date() } } as any,
        ],
      },
      take: 20, // Get a pool
    });

    // Shuffle and pick
    const shuffled = players.sort(() => 0.5 - Math.random());
    const opponents = shuffled.slice(0, limit);

    // Calculate CP for each opponent
    const results = await Promise.all(opponents.map(async (op) => {
      const cp = await this.calculateCombatPower(op.id);
      return {
        ...op,
        combatPower: cp,
      };
    }));

    return results;
  }

  /**
   * Buy a protective shield for the player
   */
  async buyShield(playerId: string, durationHours: number) {
    const shieldCosts = {
      12: 50,  // 12 hours = 50 Gems
      24: 90,  // 24 hours = 90 Gems
      72: 250, // 3 days = 250 Gems
    };

    const cost = (shieldCosts as any)[durationHours];
    if (!cost) {
      throw new Error('Invalid shield duration. Choose 12, 24, or 72 hours.');
    }

    // Deduct gems
    await this.spendResources(playerId, { gems: cost });

    // Calculate new expiry
    const player = await this.prisma.player.findUnique({ where: { id: playerId } });
    const currentShield = (player as any)?.shield_expires_at ? new Date((player as any).shield_expires_at) : new Date();
    const startTime = currentShield > new Date() ? currentShield : new Date();
    const newExpiry = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

    return this.prisma.player.update({
      where: { id: playerId },
      data: { shield_expires_at: newExpiry } as any,
    });
  }

  /**
   * Buy Monthly Pass (Blessing)
   */
  async buyMonthlyPass(playerId: string) {
    const cost = 500; // 500 Gems for 30 days
    await this.spendResources(playerId, { gems: cost });

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    return this.prisma.player.update({
      where: { id: playerId },
      data: {
        premium_pass_active: true,
        premium_expires_at: expiry,
      },
    });
  }

  /**
   * Claim daily reward from Monthly Pass
   */
  async claimMonthlyPassReward(playerId: string) {
    const player = await this.prisma.player.findUnique({ where: { id: playerId } });
    
    if (!player || !player.premium_pass_active) {
      throw new Error('You do not have an active monthly pass');
    }

    if (player.premium_expires_at && new Date(player.premium_expires_at) < new Date()) {
      // Auto-deactivate if expired
      await this.prisma.player.update({
        where: { id: playerId },
        data: { premium_pass_active: false },
      });
      throw new Error('Your monthly pass has expired');
    }

    // Check if already claimed today
    const now = new Date();
    if ((player as any).last_reward_claim) {
      const lastClaim = new Date((player as any).last_reward_claim);
      if (lastClaim.toDateString() === now.toDateString()) {
        throw new Error('You have already claimed your reward for today');
      }
    }

    // Reward: 100 Gems, 1000 Gold, 500 Rice
    const dailyReward = {
      gems: 100,
      gold: 1000,
      rice: 500,
    };

    // Use addResources which handles storage cap
    await this.addResources(playerId, dailyReward);

    return this.prisma.player.update({
      where: { id: playerId },
      data: { last_reward_claim: now } as any,
    });
  }
}

