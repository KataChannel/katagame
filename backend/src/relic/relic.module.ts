import { Module } from '@nestjs/common';
import { RelicService } from './relic.service';
import { RelicResolver } from './relic.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RelicService, RelicResolver],
  exports: [RelicService],
})
export class RelicModule {}
