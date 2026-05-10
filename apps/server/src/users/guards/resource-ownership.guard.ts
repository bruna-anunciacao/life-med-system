import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const { id } = request.params;

    if (!user) {
      return false;
    }

    if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
      return true;
    }

    if (user.id !== id && user.userId !== id) {
      throw new ForbiddenException(
        'Usuario não possui permissão para editar este usuário',
      );
    }

    return true;
  }
}
