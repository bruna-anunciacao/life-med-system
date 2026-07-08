import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListPatientsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Busca textual por nome ou CPF do paciente',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
