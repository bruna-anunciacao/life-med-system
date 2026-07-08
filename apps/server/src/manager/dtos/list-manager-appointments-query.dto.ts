import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListManagerAppointmentsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['vulnerabilityScore'],
    description: 'Campo usado para ordenar os agendamentos',
  })
  @IsOptional()
  @IsIn(['vulnerabilityScore'], { message: 'Campo de ordenação inválido' })
  sortBy?: 'vulnerabilityScore';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    default: 'asc',
    description: 'Direção da ordenação',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'Direção de ordenação inválida' })
  order?: 'asc' | 'desc' = 'asc';
}
