import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { AtLeastOneField } from './at-least-one-field.validator';

const CLINICAL_FIELDS = [
  'chiefComplaint',
  'diagnosis',
  'treatmentPlan',
  'prescriptions',
  'internalNotes',
];

export class CreateMedicalRecordDto {
  @ApiProperty({ example: 'uuid-consulta', description: 'ID da consulta' })
  @IsUUID()
  appointmentId!: string;

  @ApiProperty({
    example: 'Dor de cabeça persistente',
    description: 'Queixa principal',
    required: false,
  })
  @IsOptional()
  @IsString()
  @AtLeastOneField(CLINICAL_FIELDS)
  chiefComplaint?: string;

  @ApiProperty({
    example: 'Enxaqueca tensional',
    description: 'Diagnóstico',
    required: false,
  })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiProperty({
    example: 'Repouso e analgésicos',
    description: 'Plano terapêutico',
    required: false,
  })
  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @ApiProperty({
    example: 'Dipirona 500mg',
    description: 'Prescrições',
    required: false,
  })
  @IsOptional()
  @IsString()
  prescriptions?: string;

  @ApiProperty({
    example: 'Paciente demonstra ansiedade',
    description: 'Notas internas (não visíveis ao paciente)',
    required: false,
  })
  @IsOptional()
  @IsString()
  internalNotes?: string;
}
