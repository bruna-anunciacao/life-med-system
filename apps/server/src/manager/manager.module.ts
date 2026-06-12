import { Module } from '@nestjs/common';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';
import { ManagerRepository } from './manager.repository';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [PatientsModule],
  controllers: [ManagerController],
  providers: [ManagerService, ManagerRepository],
})
export class ManagerModule {}
