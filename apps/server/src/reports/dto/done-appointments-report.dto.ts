import { AppointmentReportItemDto } from './appointment-made.dto';

export class DoneAppointmentsReportDto {
  status!: 'COMPLETED';
  total!: number;
  appointments!: AppointmentReportItemDto[];
}
