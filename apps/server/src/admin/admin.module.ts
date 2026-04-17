import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from 'src/users/users.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [UsersModule, PrismaModule, AuthService],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule { }
