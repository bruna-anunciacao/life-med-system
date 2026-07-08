import { IsOptional, IsUUID, IsDateString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListMedicalRecordsQueryDto extends PaginationQueryDto {
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
}
