import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole, UserStatus } from '@prisma/client';

const toUpper = ({ value }: { value: string }): string => value?.toUpperCase();

export class ListAdminUsersQueryDto {
  @IsOptional()
  @Transform(toUpper)
  @IsEnum(UserRole)
  role?: 'PATIENT' | 'PROFESSIONAL';

  @IsOptional()
  @Transform(toUpper)
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() sortBy?: 'name' | 'status';
  @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
}
