import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { IsIn } from 'class-validator';

export const PROFESSIONAL_SETTABLE_APPOINTMENT_STATUSES = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.COMPLETED,
  AppointmentStatus.NO_SHOW,
] as const;

export type ProfessionalSettableAppointmentStatus =
  (typeof PROFESSIONAL_SETTABLE_APPOINTMENT_STATUSES)[number];

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    enum: PROFESSIONAL_SETTABLE_APPOINTMENT_STATUSES,
    example: AppointmentStatus.CONFIRMED,
    description:
      'Novo status. Cancelamento é feito pelo paciente em PATCH /appointments/:id/cancel.',
  })
  @IsIn([...PROFESSIONAL_SETTABLE_APPOINTMENT_STATUSES], {
    message: 'Status inválido para atualização pelo profissional',
  })
  status!: ProfessionalSettableAppointmentStatus;
}
