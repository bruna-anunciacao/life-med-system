import { IsOptional, IsString, IsDateString, IsIn, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePatientDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do paciente',
    required: false,
  })
  @IsString({ message: 'Nome deve ser texto' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: '000.000.000-00',
    description: 'CPF do paciente',
    required: false,
  })
  @IsString({ message: 'CPF deve ser texto' })
  @IsOptional()
  cpf?: string;

  @ApiProperty({
    example: 'usuario@email.com',
    description: 'E-mail do usuário',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiProperty({
    example: '+5571999999999',
    description: 'Telefone do paciente (formato internacional)',
    required: false,
  })
  @IsString({ message: 'Telefone deve ser texto' })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: '1990-05-20',
    description: 'Data de nascimento (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString({}, { message: 'Data de nascimento inválida' })
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({
    example: 'Masculino',
    description: 'Gênero do paciente',
    enum: ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'],
    required: false,
  })
  @IsString({ message: 'Gênero deve ser texto' })
  @IsOptional()
  @IsIn(
    [
      'MALE',
      'FEMALE',
      'OTHER',
      'UNDISCLOSED',
      'Masculino',
      'Feminino',
      'Outro',
      'Prefiro não informar',
    ],
    {
      message:
        'Gênero deve ser Masculino, Feminino, Outro ou Prefiro não informar',
    },
  )
  gender?: string;

  @ApiProperty({
    example: 'Rua das Flores, 123, Salvador-BA',
    description: 'Endereço do paciente',
    required: false,
  })
  @IsString({ message: 'Endereço deve ser texto' })
  @IsOptional()
  address?: string;
}
