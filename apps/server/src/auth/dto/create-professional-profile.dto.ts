import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { AppointmentModality } from '@prisma/client';

export class CreateProfessionalProfileDto {
  @IsString()
  @IsNotEmpty()
  professionalLicense: string;

  @IsString()
  @IsNotEmpty()
  specialty: string;

  @IsString()
  @IsOptional()
  subspecialty?: string;

  @IsEnum(AppointmentModality)
  @IsOptional()
  modality?: AppointmentModality;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUrl()
  @IsOptional()
  photoUrl?: string;
}
