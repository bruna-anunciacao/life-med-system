import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    example: 'uuid-do-paciente',
    description: 'ID do paciente (UUID)',
  })
  @IsString({ message: 'ID do paciente deve ser texto' })
  patientId!: string;

  @ApiProperty({
    example: 'uuid-do-profissional',
    description: 'ID do profissional (UUID)',
  })
  @IsString({ message: 'ID do profissional deve ser texto' })
  professionalId!: string;

  @ApiProperty({
    example: '2024-06-15T10:00:00.000Z',
    description: 'Data e hora da consulta (ISO 8601)',
  })
  @IsDateString({}, { message: 'Data e hora da consulta inválidas' })
  dateTime!: string;

  @ApiProperty({
    example: 'Paciente com histórico de hipertensão.',
    description: 'Observações sobre a consulta',
    required: false,
  })
  @IsString({ message: 'Notas deve ser texto' })
  @IsOptional()
  notes?: string;
}
