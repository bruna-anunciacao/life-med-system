import { AppointmentReportItemDto } from './appointment-made.dto';

export class PendingAppointmentsReportDto {
  status!: 'PENDING';
  total!: number;
  appointments!: AppointmentReportItemDto[];
}
