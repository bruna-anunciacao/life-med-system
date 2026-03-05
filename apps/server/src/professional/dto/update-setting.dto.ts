import { AppointmentModality } from '@prisma/client';
import {
  IsInt,
  Matches,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class AvailabilityDto {
  @IsInt()
  dayOfWeek!: number;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  start!: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  end!: string;
}

export class UpdateProfessionalSettingsDto {
  @IsEnum(AppointmentModality)
  modality!: AppointmentModality;

  @IsOptional()
  @IsString()
  address?: string;

  @IsArray()
  @IsString({ each: true })
  payments!: string[];

  @IsNumber()
  @Type(() => Number)
  price!: number;

  @IsArray()
  availability!: AvailabilityDto[];
}
