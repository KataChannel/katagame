import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProvinceService } from './province.service';
import { Province, PlayerProvince } from '../graphql/models/province.model';
import {
  ProvinceWhereInput,
  PlayerProvinceWhereInput,
  UnlockProvinceInput,
  UpgradeProvinceInput,
} from '../graphql/inputs/province.input';
import { PaginationInput } from '../graphql/common/filters.input';
import { MutationResponse } from '../graphql/common/responses.type';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Province)
export class ProvinceResolver {
  constructor(private provinceService: ProvinceService) {}

  // Transform helpers
  private transformProvince(province: any): Province {
    return {
      ...province,
      createdAt: province.created_at ?? undefined,
      updatedAt: province.updated_at ?? undefined,
    };
  }

  private transformPlayerProvince(pp: any): PlayerProvince {
    return {
      ...pp,
      playerId: pp.player_id,
      provinceId: pp.province_id,
      farmerLevel: pp.farmer_level ?? undefined,
      resourceLevel: pp.resource_level ?? undefined,
      developmentLevel: pp.development_level ?? undefined,
      buildingsCount: pp.buildings_count ?? undefined,
      heroId: pp.hero_id ?? undefined,
      createdAt: pp.created_at ?? undefined,
      updatedAt: pp.updated_at ?? undefined,
      province: pp.province ? this.transformProvince(pp.province) : undefined,
    };
  }

  // Get all provinces (public)
  @Query(() => [Province])
  async provinces(
    @Args('where', { nullable: true }) where?: ProvinceWhereInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<Province[]> {
    const { provinces } = await this.provinceService.findAll(
      where,
      pagination?.skip,
      pagination?.take,
    );
    return provinces.map(p => this.transformProvince(p));
  }

  // Get province by ID (public)
  @Query(() => Province)
  async province(@Args('id', { type: () => Int }) id: number): Promise<Province> {
    const province = await this.provinceService.findById(id);
    return this.transformProvince(province);
  }

  // Get player's unlocked provinces (authenticated)
  @Query(() => [PlayerProvince])
  @UseGuards(JwtAuthGuard)
  async myProvinces(
    @CurrentUser() user: any,
    @Args('where', { nullable: true }) where?: PlayerProvinceWhereInput,
  ): Promise<PlayerProvince[]> {
    const provinces = await this.provinceService.getPlayerProvinces(user.id, where);
    return provinces.map(p => this.transformPlayerProvince(p));
  }

  // Get specific player province (authenticated)
  @Query(() => PlayerProvince, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async myProvince(
    @CurrentUser() user: any,
    @Args('provinceId', { type: () => Int }) provinceId: number,
  ): Promise<PlayerProvince | null> {
    const province = await this.provinceService.getPlayerProvince(user.id, provinceId);
    return province ? this.transformPlayerProvince(province) : null;
  }

  // Unlock province mutation (authenticated)
  @Mutation(() => PlayerProvince)
  @UseGuards(JwtAuthGuard)
  async unlockProvince(
    @CurrentUser() user: any,
    @Args('input') input: UnlockProvinceInput,
  ): Promise<PlayerProvince> {
    const province = await this.provinceService.unlockProvince(user.id, input);
    return this.transformPlayerProvince(province);
  }

  // Upgrade province mutation (authenticated)
  @Mutation(() => PlayerProvince)
  @UseGuards(JwtAuthGuard)
  async upgradeProvince(
    @CurrentUser() user: any,
    @Args('input') input: UpgradeProvinceInput,
  ): Promise<PlayerProvince> {
    const province = await this.provinceService.upgradeProvince(user.id, input);
    return this.transformPlayerProvince(province);
  }
}
