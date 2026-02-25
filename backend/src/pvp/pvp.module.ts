import { Module } from '@nestjs/common';
import { PvPService } from './pvp.service';
import { PvPShopService } from './pvp-shop.service';
import { PvPResolver } from './pvp.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [PrismaModule, PlayerModule],
  providers: [PvPService, PvPShopService, PvPResolver],
  exports: [PvPService],
})
export class PvPModule {}
