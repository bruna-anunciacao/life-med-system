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
    example: 'Gestor responsável pela unidade norte.',
    description: 'Bio do gestor',
    required: false,
  })
  @IsString({ message: 'Bio deve ser texto' })
  @IsOptional()
  @MaxLength(500, { message: 'Bio deve ter no máximo 500 caracteres' })
  bio?: string;
}
