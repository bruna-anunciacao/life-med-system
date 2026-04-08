import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AppointmentModality } from '@prisma/client';

export class RegisterProfessionalDto {
  @ApiProperty({ example: 'medico@email.com', description: 'E-mail do profissional' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Senha forte (mín. 8, máx. 64 chars; deve ter maiúscula, minúscula, número e especial)',
    minLength: 8,
    maxLength: 64,
  })
  @IsString({ message: 'Senha deve ser texto' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @MaxLength(64, { message: 'A senha deve ter no máximo 64 caracteres' })
  @Matches(/(?=.*[a-z])/, {
    message: 'A senha deve conter pelo menos uma letra minúscula',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'A senha deve conter pelo menos uma letra maiúscula',
  })
  @Matches(/(?=.*\d)/, {
    message: 'A senha deve conter pelo menos um número',
  })
  @Matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message: 'A senha deve conter pelo menos um caractere especial',
  })
  password!: string;

  @ApiProperty({ example: 'Dr. Carlos Mendes', description: 'Nome completo', minLength: 2, maxLength: 100 })
  @IsString({ message: 'Nome deve ser texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: 'Nome deve conter apenas letras, espaços, hífens e apóstrofos',
  })
  name!: string;

  @ApiProperty({ example: 'CRM12345', description: 'Registro profissional (mín. 4, máx. 20 chars)', minLength: 4, maxLength: 20 })
  @IsString({ message: 'Registro profissional deve ser texto' })
  @IsNotEmpty({ message: 'Registro profissional é obrigatório' })
  @MinLength(4, {
    message: 'Registro profissional deve ter no mínimo 4 caracteres',
  })
  @MaxLength(20, {
    message: 'Registro profissional deve ter no máximo 20 caracteres',
  })
  professionalLicense!: string;

  @ApiProperty({
    example: ['Cardiologia', 'Clínica Médica'],
    description: 'Especialidade médica',
    type: [String],
  })
  @IsArray({ message: 'Especialidade deve vir em um array' })
  @IsString({ each: true, message: 'Especialidade deve ser texto (ID válido)' })
  @IsNotEmpty({ message: 'Especialidade é obrigatória' })
  @MinLength(2, { message: 'Especialidade deve ter no mínimo 2 caracteres' })
  @MaxLength(100, {
    message: 'Especialidade deve ter no máximo 100 caracteres',
  })
  specialty!: string[];

  @ApiPropertyOptional({
    example: 'CLINIC',
    description: 'Modalidade de atendimento',
    enum: AppointmentModality,
  })
  @IsOptional()
  @IsEnum(AppointmentModality, {
    message: 'Modalidade deve ser VIRTUAL, HOME_VISIT ou CLINIC',
  })
  modality!: AppointmentModality;

  @ApiPropertyOptional({
    description: 'Links de redes sociais do profissional',
    example: { referenceLink: 'https://site.com', instagram: 'https://instagram.com/medico', other: '' },
  })
  @IsOptional()
  @IsObject()
  socialLinks?: {
    referenceLink?: string;
    instagram?: string;
    other?: string;
  };

  @ApiPropertyOptional({ example: 'Médico cardiologista com 10 anos de experiência.', description: 'Biografia (máx. 500 chars)', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'Biografia deve ser texto' })
  @MaxLength(500, { message: 'Biografia deve ter no máximo 500 caracteres' })
  bio?: string;

  @ApiProperty({ example: '12345678900', description: 'CPF do profissional (somente números)' })
  @IsString({ message: 'CPF deve ser texto' })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  cpf!: string;
}
