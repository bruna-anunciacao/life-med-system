import {
  IsUUID,
  IsISO8601,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { AppointmentModality } from '@prisma/client';

export class CreateAppointmentDto {
  @IsUUID()
  professionalId!: string;

  @IsISO8601()
  dateTime!: string;

  @IsEnum(AppointmentModality)
  modality!: AppointmentModality;

  @IsOptional()
  @IsString()
  notes?: string;
}
