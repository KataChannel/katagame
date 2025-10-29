import { Module } from '@nestjs/common';
import { ProvinceService } from './province.service';
import { ProvinceResolver } from './province.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProvinceService, ProvinceResolver],
  exports: [ProvinceService],
})
export class ProvinceModule {}
