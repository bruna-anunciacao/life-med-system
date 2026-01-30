import { IsOptional, IsString, IsEmail, IsUrl, IsEnum } from 'class-validator';
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
  crm?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  @IsEnum(AppointmentModality)
  modality?: AppointmentModality;
}
