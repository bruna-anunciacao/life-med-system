import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from 'services/mail.module';
import { UsersModule } from './users/users.module';
import { AdminSeederService } from './database/admin.seeder.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PrismaModule,
    MailModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, AdminSeederService],
})
export class AppModule {}
