import { ApiPropertyOptional } from '@nestjs/swagger';
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
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { AppointmentModality } from '@prisma/client';
import { UserStatus } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'João da Silva',
    description: 'Nome completo',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser texto' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name?: string;

  @ApiPropertyOptional({
    example: 'usuario@email.com',
    description: 'E-mail do usuário',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiPropertyOptional({
    example: 'PENDING',
    description: 'Status da conta do usuário',
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus, {
    message: 'Status deve ser PENDING, COMPLETED, VERIFIED ou BLOCKED',
  })
  status?: UserStatus;

  @ApiPropertyOptional({
    example: '+5571999999999',
    description: 'Telefone no formato internacional',
  })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser texto' })
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message:
      'Telefone deve estar no formato internacional (ex: +5571999999999)',
  })
  phone?: string;

  @ApiPropertyOptional({
    example: '1990-05-20',
    description: 'Data de nascimento (ISO 8601)',
  })
  @IsOptional()
  @IsString({ message: 'Data de nascimento deve ser texto' })
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example: 'MALE',
    description: 'Gênero do usuário',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Gênero deve ser texto' })
  @MaxLength(50, { message: 'Gênero deve ter no máximo 50 caracteres' })
  gender?: string;

  @ApiPropertyOptional({
    example: 'Rua das Flores, 123, Salvador – BA',
    description: 'Endereço completo',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Endereço deve ser texto' })
  @MaxLength(200, { message: 'Endereço deve ter no máximo 200 caracteres' })
  address?: string;

  @ApiPropertyOptional({
    example: '12345678900',
    description: 'CPF (11–14 chars)',
    minLength: 11,
    maxLength: 14,
  })
  @IsOptional()
  @IsString({ message: 'CPF deve ser texto' })
  @MinLength(11, { message: 'CPF deve ter 11 caracteres' })
  @MaxLength(14, { message: 'CPF deve ter no máximo 14 caracteres' })
  cpf?: string;

  @ApiPropertyOptional({
    example: ['uuid-especialidade'],
    description: 'IDs das especialidades (somente profissionais)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value;
    return Array.isArray(value) ? value : [value];
  })
  @IsArray({ message: 'Especialidades deve ser um array' })
  @IsString({
    each: true,
    message: 'Cada especialidade deve ser um ID de texto',
  })
  specialty?: string[];

  @ApiPropertyOptional({
    example: 'CRM12345',
    description: 'Registro profissional (CRM)',
    minLength: 4,
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'CRM deve ser texto' })
  @MinLength(4, { message: 'CRM deve ter no mínimo 4 caracteres' })
  @MaxLength(20, { message: 'CRM deve ter no máximo 20 caracteres' })
  crm?: string;

  @ApiPropertyOptional({
    example: 'Médico com 10 anos de experiência.',
    description: 'Biografia',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Biografia deve ser texto' })
  @MaxLength(500, { message: 'Biografia deve ter no máximo 500 caracteres' })
  bio?: string;

  @ApiPropertyOptional({
    example: '/uploads/profile-photos/user-12345.jpg',
    description: 'URL da foto de perfil',
  })
  @IsOptional()
  @IsUrl({}, { message: 'URL da foto deve ser uma URL válida' })
  photoUrl?: string;

  @ApiPropertyOptional({
    example: 'CLINIC',
    description: 'Modalidade de atendimento',
    enum: AppointmentModality,
  })
  @IsOptional()
  @IsEnum(AppointmentModality, {
    message: 'Modalidade deve ser VIRTUAL, HOME_VISIT ou CLINIC',
  })
  modality?: AppointmentModality;

  @ApiPropertyOptional({
    description: 'Links de redes sociais',
    example: {
      linkedin: 'https://linkedin.com/in/medico',
      instagram: 'https://instagram.com/medico',
      other: '',
    },
  })
  @IsOptional()
  @IsObject()
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    other?: string;
  };
}
