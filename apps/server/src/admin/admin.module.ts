import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from 'src/users/users.module';
import { PatientsModule } from 'src/patients/patients.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UsersModule, PatientsModule, AuthModule],
  controllers: [AdminController],
  providers: [],
})
export class AdminModule {}
