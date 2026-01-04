import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '@prisma/client';
import { CreateProfessionalProfileDto } from './create-professional-profile.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ValidateIf((o: CreateUserDto) => o.role === UserRole.PROFESSIONAL)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateProfessionalProfileDto)
  professionalProfile?: CreateProfessionalProfileDto;
}
