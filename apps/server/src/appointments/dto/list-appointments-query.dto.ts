import { IsOptional, IsEnum, IsDateString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListAppointmentsQueryDto extends PaginationQueryDto {
  @ApiProperty({
    enum: AppointmentStatus,
    isArray: true,
    example: 'CONFIRMED',
    description:
      'Filtrar por status do agendamento. Aceita um único valor ' +
      '(?status=CONFIRMED) ou vários separados por vírgula ' +
      '(?status=PENDING,CONFIRMED).',
    required: false,
  })
  // Normaliza "PENDING,CONFIRMED" (ou repetição do param) em array; um único
  // valor vira array de um elemento. Assim `status: { in: [...] }` no
  // repositório cobre tanto filtro simples quanto por múltiplos status (aba
  // "Próximas" do paciente = PENDING + CONFIRMED).
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const list = Array.isArray(value) ? value : String(value).split(',');
    return list.map((item) => String(item).trim()).filter(Boolean);
  })
  @IsArray()
  @IsEnum(AppointmentStatus, { each: true, message: 'Status inválido' })
  @IsOptional()
  status?: AppointmentStatus[];

  @ApiProperty({
    example: '2024-06-01',
    description: 'Data inicial (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString({}, { message: 'Data inicial inválida' })
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    example: '2024-06-30',
    description: 'Data final (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString({}, { message: 'Data final inválida' })
  @IsOptional()
  endDate?: string;
}
