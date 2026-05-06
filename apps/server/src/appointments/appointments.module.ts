import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module';
import { AppointmentPatientOwnerGuard } from './guards/appointment-patient-owner.guard';
import { AppointmentProfessionalGuard } from './guards/appointment-professional.guard';

@Module({
  imports: [PrismaModule, MailModule, GoogleCalendarModule],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    AppointmentPatientOwnerGuard,
    AppointmentProfessionalGuard,
  ],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
