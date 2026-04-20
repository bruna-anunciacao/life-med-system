import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterManagerDto {
  @ApiProperty({
    example: 'gestor@clinica.com',
    description: 'E-mail do gestor',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  @ApiProperty({
    example: 'Senha@123',
    description:
      'Senha (mín. 8 chars, maiúscula, minúscula, número e caractere especial)',
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

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do gestor',
  })
  @IsString({ message: 'Nome deve ser texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name!: string;

  @ApiProperty({ example: '123.456.789-00', description: 'CPF do gestor' })
  @IsString({ message: 'CPF deve ser texto' })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  cpf!: string;

  @ApiProperty({
    example: '+5571999999999',
    description: 'Telefone no formato internacional',
  })
  @IsString({ message: 'Telefone deve ser texto' })
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message:
      'Telefone deve estar no formato internacional (ex: +5571999999999)',
  })
  phone!: string;

  @ApiProperty({
    example: 'Av. Sete de Setembro, 500, Salvador-BA',
    description: 'Endereço do gestor',
    required: false,
  })
  @IsString({ message: 'Endereço deve ser texto' })
  @IsOptional()
  @MaxLength(255, { message: 'Endereço deve ter no máximo 255 caracteres' })
  address?: string;

  @ApiProperty({
    example: 'Gestor responsável pela unidade norte.',
    description: 'Bio do gestor',
    required: false,
  })
  @IsString({ message: 'Bio deve ser texto' })
  @IsOptional()
  @MaxLength(500, { message: 'Bio deve ter no máximo 500 caracteres' })
  bio?: string;
}
