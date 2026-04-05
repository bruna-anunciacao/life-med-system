import { Module } from '@nestjs/common';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';
import { PrismaService } from '../prisma/prisma.service';
import { PatientsModule } from 'src/patients/patients.module';

@Module({
  imports: [PatientsModule],
  controllers: [ManagerController],
  providers: [ManagerService, PrismaService],
})
export class ManagerModule {}
