import { AppointmentReportItemDto } from './appointment-made.dto';

export class CancelledAppointmentsReportDto {
  status!: 'CANCELLED';
  total!: number;
  appointments!: AppointmentReportItemDto[];
}
