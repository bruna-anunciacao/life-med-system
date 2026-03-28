import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.emailVerified) {
      throw new ForbiddenException(
        'Sua conta ainda não foi verificada pelo administrador.',
      );
    }

    return true;
  }
}
