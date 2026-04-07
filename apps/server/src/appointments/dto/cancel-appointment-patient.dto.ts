import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelAppointmentDto {
  @ApiProperty({
    example: 'Surgiu um compromisso no trabalho',
    description: 'Motivo do cancelamento',
    required: false,
  })
  @IsString({ message: 'Motivo deve ser texto' })
  @MinLength(5, { message: 'Motivo deve ter no mínimo 5 caracteres' })
  @MaxLength(300, { message: 'Motivo não pode ter mais de 300 caracteres' })
  @IsOptional()
  reason?: string;
}
