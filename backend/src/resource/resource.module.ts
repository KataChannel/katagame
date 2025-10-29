import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceResolver } from './resource.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ResourceService, ResourceResolver],
  exports: [ResourceService],
})
export class ResourceModule {}
