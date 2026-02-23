import {
  IsOptional,
  IsString,
  IsEmail,
  IsUrl,
  IsEnum,
  IsObject,
} from 'class-validator';
import { AppointmentModality } from '@prisma/client'; // Import enum from Prisma
import { UserStatusEnum } from 'src/auth/enums/user-status-enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserStatusEnum)
  status?: UserStatusEnum;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  subspecialty?: string;

  @IsOptional()
  @IsString()
  professionalLicense?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @IsEnum(AppointmentModality)
  modality?: AppointmentModality;

  @IsOptional()
  @IsObject()
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    other?: string;
  };
}
