import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { AdminSeederService } from './database/admin.seeder.service';
import { ProfessionalModule } from './professional/professional.module';
import { PatientsModule } from './patients/patients.module';
import { ReportsModule } from './reports/reports.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ManagerModule } from './manager/manager.module';
import { SpecialityModule } from './speciality/speciality.module';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';
import { AddressesModule } from './addresses/addresses.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 10,
      },
    ]),
    AuthModule,
    UsersModule,
    ProfessionalModule,
    PrismaModule,
    MailModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PatientsModule,
    ReportsModule,
    AppointmentsModule,
    ManagerModule,
    SpecialityModule,
    QuestionnaireModule,
    AddressesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, AdminSeederService],
})
export class AppModule {}
