import { Module } from '@nestjs/common';
import { ProvinceDataService } from './province-data.service';
import { ProvinceDataResolver } from './province-data.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProvinceDataService, ProvinceDataResolver],
  exports: [ProvinceDataService],
})
export class ProvinceDataModule {}
