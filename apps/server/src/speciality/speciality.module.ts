import { Module } from '@nestjs/common';
import { SpecialityService } from './speciality.service';
import { SpecialityController } from './speciality.controller';
import { SpecialityRepository } from './speciality.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SpecialityController],
  providers: [SpecialityService, SpecialityRepository],
})
export class SpecialityModule {}
