import {
  IsOptional,
  IsUUID,
  IsDateString,
  IsNumber,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ListMedicalRecordsQueryDto {
  @ApiProperty({
    description: 'Filtrar pelo ID do paciente',
    required: false,
  })
  @IsUUID('all', { message: 'patientId inválido' })
  @IsOptional()
  patientId?: string;

  @ApiProperty({
    description:
      'Filtrar pelo ID do autor (médico). Pacientes ignoram esse filtro.',
    required: false,
  })
  @IsUUID('all', { message: 'authorId inválido' })
  @IsOptional()
  authorId?: string;

  @ApiProperty({
    description:
      'Busca textual no nome do paciente ou nos campos clínicos do prontuário',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    example: '2024-06-01',
    description: 'Data inicial (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString({}, { message: 'Data inicial inválida' })
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    example: '2024-06-30',
    description: 'Data final (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString({}, { message: 'Data final inválida' })
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 1, required: false })
  @Type(() => Number)
  @IsNumber({}, { message: 'Página deve ser um número' })
  @Min(1, { message: 'Página deve ser no mínimo 1' })
  @Max(1000, { message: 'Página máxima é 1000' })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ example: 10, required: false })
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit deve ser um número' })
  @Min(1, { message: 'Limit deve ser no mínimo 1' })
  @Max(100, { message: 'Limit máximo é 100 registros' })
  @IsOptional()
  limit?: number = 10;
}
