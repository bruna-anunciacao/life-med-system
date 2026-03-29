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
import { UserStatus } from '@prisma/client';

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
  @IsEnum(UserStatus, {
    message: 'Status deve ser PENDING, COMPLETED, VERIFIED ou BLOCKED',
  })
  status?: UserStatus;

  @IsOptional()
  @IsString({ message: 'Telefone deve ser texto' })
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message:
      'Telefone deve estar no formato internacional (ex: +5571999999999)',
  })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Data de nascimento deve ser texto' })
  dateOfBirth?: string;

  @IsOptional()
  @IsString({ message: 'Gênero deve ser texto' })
  @MaxLength(50, { message: 'Gênero deve ter no máximo 50 caracteres' })
  gender?: string;

  @IsOptional()
  @IsString({ message: 'Endereço deve ser texto' })
  @MaxLength(200, { message: 'Endereço deve ter no máximo 200 caracteres' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'CPF deve ser texto' })
  @MinLength(11, { message: 'CPF deve ter 11 caracteres' })
  @MaxLength(14, { message: 'CPF deve ter no máximo 14 caracteres' })
  cpf?: string;

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
