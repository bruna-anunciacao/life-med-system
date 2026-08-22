import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class DashboardOverviewQueryDto {
  @ApiPropertyOptional({
    example: '2026-07-01',
    description:
      'Data inicial do período (YYYY-MM-DD). Quando omitida, usa 30 dias antes da data final.',
  })
  @IsDateString({}, { message: 'Data inicial inválida' })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-07-31',
    description: 'Data final do período (YYYY-MM-DD). Quando omitida, usa a data atual.',
  })
  @IsDateString({}, { message: 'Data final inválida' })
  @IsOptional()
  endDate?: string;
}
