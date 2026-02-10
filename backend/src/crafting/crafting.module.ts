import { Module } from '@nestjs/common';
import { CraftingService } from './crafting.service';
import { CraftingResolver } from './crafting.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CraftingService, CraftingResolver],
  exports: [CraftingService],
})
export class CraftingModule {}
