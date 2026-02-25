import { Resolver, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GachaService } from './gacha.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ObjectType, Field } from '@nestjs/graphql';
import { Hero, PlayerHero } from '../graphql/models/hero.model';

@ObjectType()
class GachaResult {
  @Field(() => Hero)
  hero: Hero;

  @Field(() => PlayerHero, { nullable: true })
  playerHero?: PlayerHero;

  @Field()
  isDuplicate: boolean;

  @Field({ nullable: true })
  reward?: string;
}

@ObjectType()
class GachaResponse {
  @Field(() => [GachaResult])
  results: GachaResult[];

  @Field(() => Int)
  totalSpent: number;

  @Field(() => Int)
  newPityCount: number;
}

@Resolver()
export class GachaResolver {
  constructor(private gachaService: GachaService) {}

  @Mutation(() => GachaResponse)
  @UseGuards(JwtAuthGuard)
  async pullHeroGacha(
    @CurrentUser() user: any,
    @Args('count', { type: () => Int, defaultValue: 1 }) count: number,
  ): Promise<GachaResponse> {
    return this.gachaService.pullHero(user.id, count);
  }
}
