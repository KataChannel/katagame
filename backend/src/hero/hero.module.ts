import { Module } from '@nestjs/common';
import { HeroService } from './hero.service';
import { HeroResolver } from './hero.resolver';
import { GachaService } from './gacha.service';
import { GachaResolver } from './gacha.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [PrismaModule, PlayerModule],
  providers: [HeroService, HeroResolver, GachaService, GachaResolver],
  exports: [HeroService],
})
export class HeroModule {}
