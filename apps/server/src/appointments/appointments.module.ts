import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AppointmentOwnerGuard } from './guards/appointment-owner.guard';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentOwnerGuard],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}

