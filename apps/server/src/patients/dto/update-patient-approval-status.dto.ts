import { ApiProperty } from '@nestjs/swagger';
import { PatientApprovalStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdatePatientApprovalStatusDto {
  @ApiProperty({ enum: PatientApprovalStatus })
  @IsEnum(PatientApprovalStatus, {
    message: 'Status de aprovação deve ser APPROVED, PENDING ou REJECTED',
  })
  approvalStatus!: PatientApprovalStatus;
}
