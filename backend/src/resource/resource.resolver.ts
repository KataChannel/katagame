import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { Resource, PlayerResource } from '../graphql/models/resource.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Resource)
export class ResourceResolver {
  constructor(private resourceService: ResourceService) {}

  // Transform helpers
  private transformResource(r: any): Resource {
    return {
      ...r,
      nameVietnamese: r.name_vietnamese,
      nameEnglish: r.name_english,
      emoji: r.emoji ?? undefined,
      elementType: r.element_type,
      description: r.description ?? undefined,
      uses: r.uses ?? undefined,
      baseGenerationRate: r.base_generation_rate ?? 0,
      baseStorageCapacity: r.base_storage_capacity ?? 0,
      valuePoints: r.value_points ?? undefined,
      createdAt: r.created_at ?? new Date(),
      updatedAt: r.updated_at ?? new Date(),
    };
  }

  private transformPlayerResource(pr: any): PlayerResource {
    return {
      ...pr,
      playerId: pr.player_id,
      resourceType: pr.resource_type,
      lastHarvestAt: pr.last_harvest_at ?? undefined,
      createdAt: pr.created_at ?? new Date(),
      updatedAt: pr.updated_at ?? new Date(),
    };
  }

  // Get all resources (public)
  @Query(() => [Resource])
  async resources(): Promise<Resource[]> {
    const resources = await this.resourceService.findAll();
    return resources.map(r => this.transformResource(r));
  }

  // Get resource by ID (public)
  @Query(() => Resource)
  async resource(@Args('id') id: string): Promise<Resource> {
    const resource = await this.resourceService.findById(id);
    return this.transformResource(resource);
  }

  // Get player resources (authenticated)
  @Query(() => [PlayerResource])
  @UseGuards(JwtAuthGuard)
  async myResources(@CurrentUser() user: any): Promise<PlayerResource[]> {
    const resources = await this.resourceService.getPlayerResources(user.id);
    return resources.map(r => this.transformPlayerResource(r));
  }

  // Get player resource by type (authenticated)
  @Query(() => PlayerResource, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async myResource(
    @CurrentUser() user: any,
    @Args('resourceType') resourceType: string,
  ): Promise<PlayerResource | null> {
    const resource = await this.resourceService.getPlayerResource(user.id, resourceType);
    return resource ? this.transformPlayerResource(resource) : null;
  }
}
