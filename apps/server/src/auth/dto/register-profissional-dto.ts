import {
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
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

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

  @IsString({ message: 'Nome deve ser texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: 'Nome deve conter apenas letras, espaços, hífens e apóstrofos',
  })
  name!: string;

  @IsString({ message: 'Registro profissional deve ser texto' })
  @IsNotEmpty({ message: 'Registro profissional é obrigatório' })
  @MinLength(4, {
    message: 'Registro profissional deve ter no mínimo 4 caracteres',
  })
  @MaxLength(20, {
    message: 'Registro profissional deve ter no máximo 20 caracteres',
  })
  professionalLicense!: string;

  @IsString({ message: 'Especialidade deve ser texto' })
  @IsNotEmpty({ message: 'Especialidade é obrigatória' })
  @MinLength(2, { message: 'Especialidade deve ter no mínimo 2 caracteres' })
  @MaxLength(100, {
    message: 'Especialidade deve ter no máximo 100 caracteres',
  })
  specialty!: string;

  @IsOptional()
  @IsString({ message: 'Subespecialidade deve ser texto' })
  @MaxLength(100, {
    message: 'Subespecialidade deve ter no máximo 100 caracteres',
  })
  subspecialty?: string;

  @IsOptional()
  @IsEnum(AppointmentModality, {
    message: 'Modalidade deve ser VIRTUAL, HOME_VISIT ou CLINIC',
  })
  modality!: AppointmentModality;

  @IsOptional()
  @IsObject()
  socialLinks?: {
    referenceLink?: string;
    instagram?: string;
    other?: string;
  };

  @IsOptional()
  @IsString({ message: 'Biografia deve ser texto' })
  @MaxLength(500, { message: 'Biografia deve ter no máximo 500 caracteres' })
  bio?: string;

  @IsString({ message: 'CPF deve ser texto' })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  cpf!: string;
}
