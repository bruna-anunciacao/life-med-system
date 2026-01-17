import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { AppointmentModalityEnum } from '../enums/appointment-modality-enum';

export class RegisterProfessionalDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  name!: string;

  @IsString()
  professionalLicense!: string;

  @IsString()
  specialty!: string;

  @IsOptional()
  @IsString()
  subspecialty?: string;

  @IsOptional()
  @IsEnum(AppointmentModalityEnum)
  modality?: AppointmentModalityEnum;

  @IsOptional()
  @IsString()
  bio?: string;
}
