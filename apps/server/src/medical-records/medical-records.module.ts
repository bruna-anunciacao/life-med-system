import { Module } from '@nestjs/common';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordPdfService } from './medical-record-pdf.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService, MedicalRecordPdfService],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
