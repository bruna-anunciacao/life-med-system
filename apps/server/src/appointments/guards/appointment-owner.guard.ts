import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AppointmentOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const appointmentId = request.params.appointmentId;

    if (!userId || !appointmentId) {
      throw new ForbiddenException('Acesso negado');
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    if (
      appointment.patientId !== userId &&
      appointment.professionalId !== userId
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este agendamento',
      );
    }

    return true;
  }
}
