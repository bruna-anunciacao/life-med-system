import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsModule } from '../reports/reports.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, ReportsModule, MailModule],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
