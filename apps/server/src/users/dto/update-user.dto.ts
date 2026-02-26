import {
  IsOptional,
  IsString,
  IsEmail,
  IsUrl,
  IsEnum,
  IsObject,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AppointmentModality } from '@prisma/client';
import { UserStatusEnum } from 'src/auth/enums/user-status-enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser texto' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: 'Nome deve conter apenas letras, espaços, hífens e apóstrofos',
  })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsOptional()
  @IsEnum(UserStatusEnum, {
    message: 'Status deve ser PENDING, COMPLETED, VERIFIED ou BLOCKED',
  })
  status?: UserStatusEnum;

  @IsOptional()
  @IsString({ message: 'Telefone deve ser texto' })
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message:
      'Telefone deve estar no formato internacional (ex: +5571999999999)',
  })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Especialidade deve ser texto' })
  @MinLength(2, { message: 'Especialidade deve ter no mínimo 2 caracteres' })
  @MaxLength(100, {
    message: 'Especialidade deve ter no máximo 100 caracteres',
  })
  specialty?: string;

  @IsOptional()
  @IsString({ message: 'Subespecialidade deve ser texto' })
  @MaxLength(100, {
    message: 'Subespecialidade deve ter no máximo 100 caracteres',
  })
  subspecialty?: string;

  @IsOptional()
  @IsString({ message: 'CRM deve ser texto' })
  @MinLength(4, { message: 'CRM deve ter no mínimo 4 caracteres' })
  @MaxLength(20, { message: 'CRM deve ter no máximo 20 caracteres' })
  crm?: string;

  @IsOptional()
  @IsString({ message: 'Biografia deve ser texto' })
  @MaxLength(500, { message: 'Biografia deve ter no máximo 500 caracteres' })
  bio?: string;

  @IsOptional()
  @IsUrl({}, { message: 'URL da foto deve ser uma URL válida' })
  photoUrl?: string;

  @IsOptional()
  @IsEnum(AppointmentModality, {
    message: 'Modalidade deve ser VIRTUAL, HOME_VISIT ou CLINIC',
  })
  modality?: AppointmentModality;

  @IsOptional()
  @IsObject()
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    other?: string;
  };
}
