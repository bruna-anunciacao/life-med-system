import { ApiProperty } from '@nestjs/swagger';

export class ProfessionalResponseDto {
  @ApiProperty({
    example: 'uuid-profissional',
    description: 'ID do profissional',
  })
  id!: string;

  @ApiProperty({
    example: 'Dr. João Silva',
    description: 'Nome do profissional',
  })
  name!: string;

  @ApiProperty({
    example: 'joao@lifemed.com',
    description: 'Email do profissional',
  })
  email!: string;
}

export class PatientResponseDto {
  @ApiProperty({ example: 'uuid-paciente', description: 'ID do paciente' })
  id!: string;

  @ApiProperty({ example: 'Maria Santos', description: 'Nome do paciente' })
  name!: string;

  @ApiProperty({ example: 'maria@email.com', description: 'Email do paciente' })
  email!: string;
}

export class AppointmentResponseDto {
  @ApiProperty({
    example: 'uuid-agendamento',
    description: 'ID do agendamento',
  })
  id!: string;

  @ApiProperty({
    example: '2026-04-08T14:00:00Z',
    description: 'Data/hora da consulta',
  })
  dateTime!: Date;

  @ApiProperty({
    example: 'PENDING',
    description: 'Status: PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW',
  })
  status!: string;

  @ApiProperty({
    example: 'Primeira consulta',
    description: 'Notas/motivo da consulta',
    nullable: true,
  })
  notes?: string;

  @ApiProperty({
    example: '2026-04-07T03:27:01.131Z',
    description: 'Data de criação',
  })
  createdAt!: Date;

  @ApiProperty({
    type: ProfessionalResponseDto,
    description: 'Dados do profissional',
  })
  professional!: ProfessionalResponseDto;

  @ApiProperty({ type: PatientResponseDto, description: 'Dados do paciente' })
  patient!: PatientResponseDto;
}

export class AppointmentListResponseDto {
  @ApiProperty({
    type: [AppointmentResponseDto],
    description: 'Lista de agendamentos',
  })
  data!: AppointmentResponseDto[];

  @ApiProperty({ example: 1, description: 'Página atual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Registros por página' })
  limit!: number;

  @ApiProperty({ example: 5, description: 'Total de registros' })
  total!: number;
}
