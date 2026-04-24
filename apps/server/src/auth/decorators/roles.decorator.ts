import { SetMetadata } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const STATUS_KEYS = 'status';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const Status = (...status: UserStatus[]) =>
  SetMetadata(STATUS_KEYS, status);
