import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class ProfessionalRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || user.role !== UserRole.PROFESSIONAL) {
      throw new ForbiddenException('Only professionals can update settings');
    }

    return true;
  }
}
