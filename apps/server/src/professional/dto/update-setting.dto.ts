import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentModality } from '@prisma/client';
import {
  IsInt,
  Matches,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class AvailabilityDto {
  @ApiProperty({
    example: 1,
    description: 'Dia da semana (0 = Domingo, 6 = Sábado)',
  })
  @IsInt()
  dayOfWeek!: number;

  @ApiProperty({ example: '08:00', description: 'Horário de início (HH:mm)' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  start!: string;

  @ApiProperty({ example: '17:00', description: 'Horário de término (HH:mm)' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  end!: string;
}

export class UpdateProfessionalSettingsDto {
  @ApiProperty({
    example: 'CLINIC',
    description: 'Modalidade de atendimento',
    enum: AppointmentModality,
  })
  @IsEnum(AppointmentModality)
  modality!: AppointmentModality;

  @ApiPropertyOptional({
    example: 'Rua das Flores, 123, Salvador – BA',
    description: 'Endereço do consultório',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: ['PIX', 'Cartão de Crédito'],
    description: 'Formas de pagamento aceitas',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  payments!: string[];

  @ApiProperty({ example: 150, description: 'Valor da consulta em reais' })
  @IsNumber()
  @Type(() => Number)
  price!: number;

  @ApiProperty({
    description: 'Disponibilidade semanal do profissional',
    type: [AvailabilityDto],
    example: [{ dayOfWeek: 1, start: '08:00', end: '17:00' }],
  })
  @IsArray()
  availability!: AvailabilityDto[];
}
