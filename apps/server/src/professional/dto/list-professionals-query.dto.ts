import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListProfessionalsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Busca textual por nome do profissional ou especialidade',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nome de especialidade (match exato)',
  })
  @IsOptional()
  @IsString()
  speciality?: string;

  @ApiPropertyOptional({ description: 'Filtrar por cidade (match exato)' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filtrar por estado/UF (match exato)' })
  @IsOptional()
  @IsString()
  state?: string;
}
