import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';

export class UpdatePatientDto {
  @IsString({ message: 'Telefone deve ser texto' })
  @IsOptional()
  phone?: string;

  @IsDateString({}, { message: 'Data de nascimento inválida' })
  @IsOptional()
  dateOfBirth?: string;

  @IsString({ message: 'Gênero deve ser texto' })
  @IsOptional()
  @IsIn(
    [
      'MALE',
      'FEMALE',
      'OTHER',
      'UNDISCLOSED',
      'Masculino',
      'Feminino',
      'Outro',
      'Prefiro não informar',
    ],
    {
      message: 'Gênero deve ser Masculino, Feminino, Outro ou Prefiro não informar',
    },
  )
  gender?: string;

  @IsString({ message: 'Endereço deve ser texto' })
  @IsOptional()
  address?: string;
}
