import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ResourceSynergyService } from './resource-synergy.service';
import { ResourceSynergyResolver } from './resource-synergy.resolver';

@Module({
  imports: [PrismaModule],
  providers: [ResourceSynergyService, ResourceSynergyResolver],
  exports: [ResourceSynergyService],
})
export class ResourceSynergyModule {}
