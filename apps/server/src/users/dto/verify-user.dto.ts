import { IsBoolean } from 'class-validator';

export class VerifyUserDto {
  @IsBoolean({ message: 'emailVerified deve ser um valor booleano' })
  emailVerified!: boolean;
}
