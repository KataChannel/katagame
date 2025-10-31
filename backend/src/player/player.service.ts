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
          province_id: 2, // Hồ Chí Minh
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
   * Add resources to player
   */
  async addResources(playerId: string, resources: any) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      throw new Error('Player not found');
    }

    const currentResources = player.resources as any || {};
    const updatedResources = { ...currentResources };

    for (const [key, value] of Object.entries(resources)) {
      updatedResources[key] = (updatedResources[key] || 0) + Number(value);
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
}

