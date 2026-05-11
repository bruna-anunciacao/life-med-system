import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreatePatientDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  @IsString({ message: 'Telefone deve ser texto' })
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  phone!: string;

  @IsString({ message: 'CPF deve ser texto' })
  @IsOptional()
  cpf?: string;

  @IsDateString({}, { message: 'Data de nascimento inválida' })
  @IsOptional()
  dateOfBirth?: string;

  @IsString({ message: 'Gênero deve ser texto' })
  @IsOptional()
  @IsIn(['M', 'F', 'O'], {
    message: 'Gênero deve ser M, F ou O',
  })
  gender?: string;
}
