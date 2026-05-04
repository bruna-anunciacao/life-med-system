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
  @IsIn(['M', 'F', 'O'], {
    message: 'Gênero deve ser M, F ou O',
  })
  gender?: string;
}
