import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
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
    example: 'NovaSenha@456',
    description: 'Nova senha forte (mín. 8, máx. 64 chars)',
    minLength: 8,
    maxLength: 64,
  })
  @IsString({ message: 'Senha deve ser texto' })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @MaxLength(64, { message: 'A senha deve ter no máximo 64 caracteres' })
  @Matches(/(?=.*[a-z])/, {
    message: 'A senha deve conter pelo menos uma letra minúscula',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'A senha deve conter pelo menos uma letra maiúscula',
  })
  @Matches(/(?=.*\d)/, {
    message: 'A senha deve conter pelo menos um número',
  })
  @Matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message: 'A senha deve conter pelo menos um caractere especial',
  })
  newPassword!: string;
}
