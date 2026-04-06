import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({ example: 'usuario@email.com', description: 'E-mail para reenvio do link de verificação' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string;
}
