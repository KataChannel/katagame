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
          gold: 10,
          rice: 10,
          lumber: 10,
          stone: 10,
          bazan: 10,
          gems: 1500,
          culture: 20,
        },
        status: 'active',
        region: 'global',
      },
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
}
