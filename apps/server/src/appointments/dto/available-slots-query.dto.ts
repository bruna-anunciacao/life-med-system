import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AvailableSlotsQueryDto {
  @ApiProperty({
    example: '2026-04-10',
    description: 'Data para consultar horários disponíveis (YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'Data deve estar no formato YYYY-MM-DD' })
  date!: string;
}

export class AvailableSlotDto {
  @ApiProperty({ example: '09:00', description: 'Horário do slot' })
  time!: string;

  @ApiProperty({ example: true, description: 'Se o slot está disponível' })
  available!: boolean;
}

export class AvailableSlotsResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  professionalId!: string;

  @ApiProperty({ example: '2026-04-10' })
  date!: string;

  @ApiProperty({ type: [AvailableSlotDto] })
  slots!: AvailableSlotDto[];
}
