import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    example: 'paciente@email.com',
    description: 'E-mail do usuário',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha (mín. 6, máx. 64 caracteres)',
    minLength: 6,
    maxLength: 64,
  })
  @IsString({ message: 'Senha deve ser texto' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  @MaxLength(64, { message: 'A senha deve ter no máximo 64 caracteres' })
  password!: string;

  @ApiProperty({
    example: 'João da Silva',
    description: 'Nome completo (mín. 2, máx. 100 chars)',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Nome deve ser texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name!: string;

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
    example: '12345678900',
    description: 'CPF do usuário (somente números)',
  })
  @IsString({ message: 'CPF deve ser texto' })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  cpf!: string;

  @ApiProperty({
    example: '1990-05-20',
    description: 'Data de nascimento (ISO 8601)',
  })
  @Type(() => Date)
  @IsDate({ message: 'Data de nascimento inválida' })
  @IsNotEmpty({ message: 'Data de nascimento é obrigatória' })
  dateOfBirth!: Date;

  @ApiProperty({
    example: 'MALE',
    description: 'Gênero do usuário',
    enum: ['MALE', 'FEMALE', 'OTHER', 'UNDISCLOSED'],
  })
  @IsString({ message: 'Gênero deve ser texto' })
  @IsNotEmpty({ message: 'Gênero é obrigatório' })
  @IsIn(['MALE', 'FEMALE', 'OTHER', 'UNDISCLOSED'], {
    message: 'Gênero deve ser MALE, FEMALE, OTHER ou UNDISCLOSED',
  })
  gender!: string;
}
