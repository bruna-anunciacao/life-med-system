import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole} from '@prisma/client';

@Injectable()
export class ManagerRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Acesso permitido apenas para Managers');
    }

    return true;
  }
}
