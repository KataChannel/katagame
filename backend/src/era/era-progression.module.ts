import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EraProgressionService } from './era-progression.service';
import { EraProgressionResolver } from './era-progression.resolver';

@Module({
  imports: [PrismaModule],
  providers: [EraProgressionService, EraProgressionResolver],
  exports: [EraProgressionService],
})
export class EraProgressionModule {}
