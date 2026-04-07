import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class ListAppointmentsQueryDto {
  @ApiProperty({
    enum: AppointmentStatus,
    example: 'CONFIRMED',
    description: 'Filtrar por status do agendamento',
    required: false,
  })
  @IsEnum(AppointmentStatus, { message: 'Status inválido' })
  @IsOptional()
  status?: AppointmentStatus;

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

  @ApiProperty({
    example: 1,
    description: 'Página da paginação (começa em 1, máximo 1000)',
    required: false,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Página deve ser um número' })
  @Min(1, { message: 'Página deve ser no mínimo 1' })
  @Max(1000, { message: 'Página máxima é 1000' })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Quantidade de registros por página (1-100, padrão 10)',
    required: false,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit deve ser um número' })
  @Min(1, { message: 'Limit deve ser no mínimo 1' })
  @Max(100, { message: 'Limit máximo é 100 registros' })
  @IsOptional()
  limit?: number = 10;
}
