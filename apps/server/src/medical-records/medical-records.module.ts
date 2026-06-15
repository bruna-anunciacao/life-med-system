import { Module } from '@nestjs/common';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsRepository } from './medical-records.repository';
import { MedicalRecordPdfService } from './medical-record-pdf.service';
import { PrismaModule } from '../prisma/prisma.module';
import { QuestionnaireModule } from '../questionnaire/questionnaire.module';

@Module({
  imports: [PrismaModule, QuestionnaireModule],
  controllers: [MedicalRecordsController],
  providers: [
    MedicalRecordsService,
    MedicalRecordsRepository,
    MedicalRecordPdfService,
  ],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
