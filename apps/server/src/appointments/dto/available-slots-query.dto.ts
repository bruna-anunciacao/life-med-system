import { IsUUID, IsDateString } from 'class-validator';

export class AvailableSlotsQueryDto {
  @IsUUID()
  professionalId!: string;

  @IsDateString()
  date!: string;
}
