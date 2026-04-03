import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole} from '@prisma/client';

@Injectable()
export class GestorRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== UserRole.GESTOR) {
      throw new ForbiddenException('Acesso permitido apenas para Gestores');
    }

    return true;
  }
}
