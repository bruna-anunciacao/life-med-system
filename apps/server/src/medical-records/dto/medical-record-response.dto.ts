import { ApiProperty } from '@nestjs/swagger';

export class MedicalRecordAuthorDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
}

export class MedicalRecordPatientDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
}

export class MedicalRecordAppointmentDto {
  @ApiProperty() id!: string;
  @ApiProperty() dateTime!: Date;
  @ApiProperty() modality!: string;
}

export class MedicalRecordResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() appointmentId!: string;
  @ApiProperty() patientId!: string;
  @ApiProperty({ type: MedicalRecordAuthorDto })
  author!: MedicalRecordAuthorDto;
  @ApiProperty({ type: MedicalRecordPatientDto, required: false })
  patient?: MedicalRecordPatientDto;
  @ApiProperty({ type: MedicalRecordAppointmentDto, required: false })
  appointment?: MedicalRecordAppointmentDto;
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
  @ApiProperty({ type: MedicalRecordAppointmentDto, required: false })
  appointment?: MedicalRecordAppointmentDto;
  @ApiProperty({ nullable: true }) chiefComplaint!: string | null;
  @ApiProperty({ nullable: true }) diagnosis!: string | null;
  @ApiProperty({ nullable: true }) treatmentPlan!: string | null;
  @ApiProperty({ nullable: true }) prescriptions!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class MedicalRecordListResponseDto {
  @ApiProperty({ type: [MedicalRecordResponseDto] })
  data!: MedicalRecordResponseDto[];
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 10 }) limit!: number;
  @ApiProperty({ example: 0 }) total!: number;
}

export class MedicalRecordPatientListResponseDto {
  @ApiProperty({ type: [MedicalRecordPatientResponseDto] })
  data!: MedicalRecordPatientResponseDto[];
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 10 }) limit!: number;
  @ApiProperty({ example: 0 }) total!: number;
}
