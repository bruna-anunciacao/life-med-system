import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class VerifyUserDto {
  @ApiProperty({
    example: true,
    description: 'Define se o e-mail do usuário está verificado',
  })
  @IsBoolean({ message: 'emailVerified deve ser um valor booleano' })
  emailVerified!: boolean;
}
