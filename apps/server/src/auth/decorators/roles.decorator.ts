import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from '../enums/user-role-enum';
import { UserStatusEnum } from '../enums/user-status-enum';

export const ROLES_KEY = 'roles';
export const STATUS_KEYS = 'status';

export const Roles = (...roles: UserRoleEnum[]) =>
  SetMetadata(ROLES_KEY, roles);

export const Status = (...status: UserStatusEnum[]) =>
  SetMetadata(STATUS_KEYS, status);
