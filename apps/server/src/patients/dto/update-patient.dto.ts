import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePatientDto {
  @ApiProperty({
    example: '71999999999',
    description: 'Telefone do paciente',
    required: false,
  })
  @IsString({ message: 'Telefone deve ser texto' })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: '1990-05-20',
    description: 'Data de nascimento (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString({}, { message: 'Data de nascimento inválida' })
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({
    example: 'F',
    description: 'Gênero: M (masculino), F (feminino), O (outro)',
    enum: ['M', 'F', 'O'],
    required: false,
  })
  @IsString({ message: 'Gênero deve ser texto' })
  @IsOptional()
  @IsIn(['M', 'F', 'O'], {
    message: 'Gênero deve ser M, F ou O',
  })
  gender?: string;
}
