import { AppointmentStatus } from '@prisma/client';

export class AppointmentReportItemDto {
  id!: string;
  dateTime!: Date;
  status!: AppointmentStatus;
  createdAt!: Date;
  patientId!: string;
  patientName!: string;
  professionalId!: string;
  professionalName!: string;
  specialty!: string;
  modality!: string;
  price!: number;
}
