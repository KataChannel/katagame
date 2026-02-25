import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventResolver } from './event.resolver';
import { WorldBossService } from './world-boss.service';
import { WorldBossResolver } from './world-boss.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EventService, EventResolver, WorldBossService, WorldBossResolver],
  exports: [EventService, WorldBossService],
})
export class EventModule {}
