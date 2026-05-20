import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AtLeastOneField } from './at-least-one-field.validator';

const CLINICAL_FIELDS = [
  'chiefComplaint',
  'diagnosis',
  'treatmentPlan',
  'prescriptions',
  'internalNotes',
];

export class UpdateMedicalRecordDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @AtLeastOneField(CLINICAL_FIELDS)
  chiefComplaint?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  prescriptions?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  internalNotes?: string;
}
