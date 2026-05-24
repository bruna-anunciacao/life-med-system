import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Token UUID v4 recebido por e-mail para redefinição de senha',
  })
  @IsString({ message: 'Token deve ser texto' })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  @IsUUID('4', { message: 'Token inválido' })
  token!: string;

  @ApiProperty({
    example: '123456',
    description: 'Nova senha (mín. 6, máx. 64 caracteres)',
    minLength: 6,
    maxLength: 64,
  })
  @IsString({ message: 'Senha deve ser texto' })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  @MaxLength(64, { message: 'A senha deve ter no máximo 64 caracteres' })
  newPassword!: string;
}
