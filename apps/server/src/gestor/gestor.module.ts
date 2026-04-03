import { Module } from '@nestjs/common';
import { GestorController } from './gestor.controller';
import { GestorService } from './gestor.service';
import { PrismaService } from '../prisma/prisma.service';
import { PatientsModule } from 'src/patients/patients.module';

@Module({
  controllers: [GestorController, PatientsModule],
  providers: [GestorService, PrismaService],
})
export class GestorModule {}
