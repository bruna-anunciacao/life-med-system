import { ApiProperty } from '@nestjs/swagger';

export class MedicalRecordAuthorDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
}

export class MedicalRecordResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() appointmentId!: string;
  @ApiProperty() patientId!: string;
  @ApiProperty({ type: MedicalRecordAuthorDto })
  author!: MedicalRecordAuthorDto;
  @ApiProperty({ nullable: true }) chiefComplaint!: string | null;
  @ApiProperty({ nullable: true }) diagnosis!: string | null;
  @ApiProperty({ nullable: true }) treatmentPlan!: string | null;
  @ApiProperty({ nullable: true }) prescriptions!: string | null;
  @ApiProperty({ nullable: true }) internalNotes!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class MedicalRecordPatientResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() appointmentId!: string;
  @ApiProperty() patientId!: string;
  @ApiProperty({ type: MedicalRecordAuthorDto })
  author!: MedicalRecordAuthorDto;
  @ApiProperty({ nullable: true }) chiefComplaint!: string | null;
  @ApiProperty({ nullable: true }) diagnosis!: string | null;
  @ApiProperty({ nullable: true }) treatmentPlan!: string | null;
  @ApiProperty({ nullable: true }) prescriptions!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
