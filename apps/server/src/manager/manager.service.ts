import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus, UserRole } from '@prisma/client';

@Injectable()
export class ManagerService {
  constructor(private prisma: PrismaService) {}

  async cancelAppointment(
    managerUserId: string,
    appointmentId: string,
    reason?: string,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Consulta não encontrada');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Consulta já está cancelada');
    }

    const manager = await this.prisma.managerProfile.findUnique({
      where: { userId: managerUserId },
    });

    if (!manager) {
      throw new NotFoundException('Perfil de gestor não encontrado');
    }

    const notes = reason
      ? `[CANCELADO PELO GESTOR] ${reason}`
      : '[CANCELADO PELO GESTOR]';

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelledByManagerId: manager.id,
        cancelledAt: new Date(),
        notes,
      },
      include: {
        patient: { include: { patientProfile: true } },
        professional: { include: { professionalProfile: true } },
        scheduledByManager: { include: { user: true } },
        cancelledByManager: { include: { user: true } },
      },
    });
  }

  async getAppointmentsByManager() {
    return this.prisma.appointment.findMany({
      include: {
        patient: { include: { patientProfile: true } },
        professional: { include: { professionalProfile: true } },
        scheduledByManager: { include: { user: true } },
        cancelledByManager: { include: { user: true } },
      },
      orderBy: { dateTime: 'desc' },
    });
  }

  async getProfessionalAvailability(professionalId: string) {
    const professional = await this.prisma.user.findUnique({
      where: { id: professionalId },
      include: {
        professionalProfile: {
          include: {
            specialities: true,
          },
        },
      },
    });

    if (!professional || professional.role !== UserRole.PROFESSIONAL) {
      throw new NotFoundException('Profissional não encontrado');
    }

    const availability = await this.prisma.availability.findMany({
      where: {
        professionalId,
        validUntil: null,
      },
      orderBy: { dayOfWeek: 'asc' },
    });

    return {
      professional: {
        id: professional.id,
        name: professional.name,
        email: professional.email,
        specialty:
          professional.professionalProfile?.specialities
            ?.map((s) => s.name)
            .join(', ') || '-',
      },
      availability: availability.map((a) => ({
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
    };
  }
}
