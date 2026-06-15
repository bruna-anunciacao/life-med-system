import { Module } from '@nestjs/common';
import { ProfessionalService } from './professional.service';
import { ProfessionalRepository } from './professional.repository';
import { ProfessionalController } from './professional.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module';
import { QuestionnaireModule } from '../questionnaire/questionnaire.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    GoogleCalendarModule,
    QuestionnaireModule,
  ],
  controllers: [ProfessionalController],
  providers: [ProfessionalService, ProfessionalRepository],
  exports: [ProfessionalService],
})
export class ProfessionalModule {}
