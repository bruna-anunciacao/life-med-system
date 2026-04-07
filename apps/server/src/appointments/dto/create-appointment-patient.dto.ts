import {
  IsString,
  IsDateString,
  IsOptional,
  IsUUID,
  MaxLength,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(dateTimeString: string) {
    const appointmentDate = new Date(dateTimeString);
    const now = new Date();
    return appointmentDate > now;
  }

  defaultMessage() {
    return 'A data/hora da consulta não pode ser no passado';
  }
}

export class CreateAppointmentPatientDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID do profissional (UUID)',
  })
  @IsUUID('4', { message: 'ID do profissional deve ser um UUID válido' })
  professionalId!: string;

  @ApiProperty({
    example: '2024-06-15T10:00:00Z',
    description: 'Data/hora da consulta (ISO 8601 UTC) - deve ser futura',
  })
  @IsDateString({}, { message: 'Data/hora deve estar no formato ISO 8601' })
  @Validate(IsFutureDateConstraint)
  dateTime!: string;

  @ApiProperty({
    example: 'Tenho dúvidas sobre minha medicação',
    description: 'Observações/motivo da consulta',
    required: false,
  })
  @IsString({ message: 'Notas deve ser texto' })
  @MaxLength(500, { message: 'Notas não pode ter mais de 500 caracteres' })
  @IsOptional()
  notes?: string;
}
