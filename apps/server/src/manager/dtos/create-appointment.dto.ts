import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @IsString({ message: 'ID do paciente deve ser texto' })
  patientId!: string;

  @IsString({ message: 'ID do profissional deve ser texto' })
  professionalId!: string;

  @IsDateString({}, { message: 'Data e hora da consulta inválidas' })
  dateTime!: string;

  @IsString({ message: 'Notas deve ser texto' })
  @IsOptional()
  notes?: string;
}
