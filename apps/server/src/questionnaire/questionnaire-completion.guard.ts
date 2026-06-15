import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PatientApprovalStatus, UserRole } from '@prisma/client';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

const QUESTIONNAIRE_REDIRECT_PATH = '/dashboard/patient/questionnaire';
const PATIENT_PENDING_APPROVAL_PATH = '/auth/patient-pending-approval';
const PATIENT_REJECTED_PATH = '/auth/patient-rejected';
const ALWAYS_ALLOWED = new Set(['GET:/users/me']);
const QUESTIONNAIRE_ALLOWED_WHILE_INCOMPLETE = new Set([
  'GET:/questionnaire/questions',
  'GET:/questionnaire/me',
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
    if (ALWAYS_ALLOWED.has(routeKey)) {
      return true;
    }

    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId: user.userId },
      select: { questionnaireCompleted: true, approvalStatus: true },
    });

    if (!patientProfile?.questionnaireCompleted) {
      if (QUESTIONNAIRE_ALLOWED_WHILE_INCOMPLETE.has(routeKey)) {
        return true;
      }

      throw new ForbiddenException({
        code: 'QUESTIONNAIRE_REQUIRED',
        message: 'Questionário de vulnerabilidade pendente.',
        redirectTo: QUESTIONNAIRE_REDIRECT_PATH,
      });
    }

    if (patientProfile.approvalStatus === PatientApprovalStatus.PENDING) {
      throw new ForbiddenException({
        code: 'PATIENT_APPROVAL_PENDING',
        message: 'Cadastro do paciente aguardando aprovação.',
        redirectTo: PATIENT_PENDING_APPROVAL_PATH,
      });
    }

    if (patientProfile.approvalStatus === PatientApprovalStatus.REJECTED) {
      throw new ForbiddenException({
        code: 'PATIENT_REJECTED',
        message: 'Cadastro do paciente rejeitado.',
        redirectTo: PATIENT_REJECTED_PATH,
      });
    }

    return true;
  }
}
