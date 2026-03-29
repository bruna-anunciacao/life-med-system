import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterAdminDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  @IsString({ message: 'Senha deve ser texto' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
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
  password!: string;

  @IsString({ message: 'Nome deve ser texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name!: string;

  @IsString({ message: 'CPF deve ser texto' })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  cpf!: string;
}
