import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/paginated-response.dto';

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
  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class MedicalRecordPatientListResponseDto {
  @ApiProperty({ type: [MedicalRecordPatientResponseDto] })
  data!: MedicalRecordPatientResponseDto[];
  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
