import { CanActivate, Injectable, ForbiddenException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UserRole } from '@prisma/client';

@Injectable()
export class PatientRoleGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user || (user as any).role !== UserRole.PATIENT) {
      throw new ForbiddenException('Acesso negado — somente PATIENT.');
    }

    return true;
  }
}
