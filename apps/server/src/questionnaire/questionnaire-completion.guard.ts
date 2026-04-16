import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

const QUESTIONNAIRE_REDIRECT_PATH = '/dashboard/patient/questionnaire';
const WHITELIST = new Set([
  'GET:/users/me',
  'GET:/questionnaire/questions',
  'POST:/questionnaire',
]);

@Injectable()
export class QuestionnaireCompletionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as
      | { userId?: string; role?: UserRole }
      | undefined;

    if (!user?.userId || user.role !== UserRole.PATIENT) {
      return true;
    }

    const routeKey = `${request.method.toUpperCase()}:${request.originalUrl.split('?')[0]}`;

    if (WHITELIST.has(routeKey)) {
      return true;
    }

    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId: user.userId },
      select: { questionnaireCompleted: true },
    });

    if (!patientProfile?.questionnaireCompleted) {
      throw new ForbiddenException({
        code: 'QUESTIONNAIRE_REQUIRED',
        message: 'Questionário de vulnerabilidade pendente.',
        redirectTo: QUESTIONNAIRE_REDIRECT_PATH,
      });
    }

    return true;
  }
}
