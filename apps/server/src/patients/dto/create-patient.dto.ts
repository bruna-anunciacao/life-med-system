import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'Maria Silva', description: 'Nome completo do paciente' })
  @IsString({ message: 'Nome deve ser texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name!: string;

  @ApiProperty({ example: 'maria@email.com', description: 'E-mail do paciente' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  @ApiProperty({ example: '71999999999', description: 'Telefone do paciente' })
  @IsString({ message: 'Telefone deve ser texto' })
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  phone!: string;

  @ApiProperty({ example: '123.456.789-00', description: 'CPF do paciente', required: false })
  @IsString({ message: 'CPF deve ser texto' })
  @IsOptional()
  cpf?: string;

  @ApiProperty({ example: '1990-05-20', description: 'Data de nascimento (YYYY-MM-DD)', required: false })
  @IsDateString({}, { message: 'Data de nascimento inválida' })
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ example: 'F', description: 'Gênero: M (masculino), F (feminino), O (outro)', enum: ['M', 'F', 'O'], required: false })
  @IsString({ message: 'Gênero deve ser texto' })
  @IsOptional()
  @IsIn(['M', 'F', 'O'], {
    message: 'Gênero deve ser M, F ou O',
  })
  gender?: string;

  @ApiProperty({ example: 'Rua das Flores, 123, Salvador-BA', description: 'Endereço do paciente', required: false })
  @IsString({ message: 'Endereço deve ser texto' })
  @IsOptional()
  address?: string;
}
