import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class ExportAppointmentsQueryDto {
  @IsOptional()
  @IsUUID()
  professionalId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
