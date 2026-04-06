import { IsOptional, IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class ListAppointmentsQueryDto {
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
