import { IsDate, IsEmail, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @Type(() => Date)
  @IsDate()
  dateOfBirth!: Date;

  @IsString()
  gender!: string;
}
