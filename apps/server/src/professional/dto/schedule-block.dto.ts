import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateScheduleBlockDto {
  @ApiProperty({
    description: 'Data do bloqueio no formato YYYY-MM-DD',
    example: '2024-06-15',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Data deve estar no formato YYYY-MM-DD',
  })
  date!: string;

  @ApiPropertyOptional({
    description: 'Horário de início no formato HH:MM. Se nulo, bloqueia o dia todo.',
    example: '14:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'Horário deve estar no formato HH:MM',
  })
  startTime?: string;

  @ApiPropertyOptional({
    description: 'Horário de término no formato HH:MM. Se nulo, bloqueia o dia todo.',
    example: '18:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'Horário deve estar no formato HH:MM',
  })
  endTime?: string;
}
