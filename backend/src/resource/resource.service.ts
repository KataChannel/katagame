import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResourceService {
  constructor(private prisma: PrismaService) {}

  // Get all resources
  async findAll() {
    return this.prisma.resource.findMany({
      orderBy: { id: 'asc' },
    });
  }

  // Get resource by ID
  async findById(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    return resource;
  }

  // Get player resources
  async getPlayerResources(playerId: string) {
    return this.prisma.playerResource.findMany({
      where: { player_id: playerId },
      orderBy: { resource_type: 'asc' },
    });
  }

  // Get player resource by type
  async getPlayerResource(playerId: string, resourceType: string) {
    return this.prisma.playerResource.findUnique({
      where: {
        player_id_resource_type: {
          player_id: playerId,
          resource_type: resourceType,
        },
      },
    });
  }
}
