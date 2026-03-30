import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRoleEnum } from '../enums/user-role-enum';

@Injectable()
export class GestorRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== UserRoleEnum.GESTOR) {
      throw new ForbiddenException('Acesso permitido apenas para GESTOREs');
    }

    return true;
  }
}
