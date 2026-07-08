import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Base DTO de paginação (offset-based).
 *
 * DTOs de listagem devem estender esta classe e adicionar apenas seus próprios
 * filtros (search, status, datas, etc). Assim `page`/`limit` ficam centralizados
 * em um único lugar, com validação e defaults consistentes em toda a API.
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Página da paginação (começa em 1, máximo 1000)',
  })
  @Type(() => Number)
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @Min(1, { message: 'Página deve ser no mínimo 1' })
  @Max(1000, { message: 'Página máxima é 1000' })
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'Quantidade de registros por página (1-100, padrão 10)',
  })
  @Type(() => Number)
  @IsInt({ message: 'Limit deve ser um número inteiro' })
  @Min(1, { message: 'Limit deve ser no mínimo 1' })
  @Max(100, { message: 'Limit máximo é 100 registros' })
  @IsOptional()
  limit: number = 10;
}
