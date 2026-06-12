import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ManagerRepository } from './manager.repository';
import { AppointmentStatus, UserRole } from '@prisma/client';

@Injectable()
export class ManagerService {
  constructor(private repository: ManagerRepository) {}

  async cancelAppointment(
    managerUserId: string,
    appointmentId: string,
    reason?: string,
  ) {
    const appointment =
      await this.repository.findAppointmentById(appointmentId);

    if (!appointment) {
      throw new NotFoundException('Consulta não encontrada');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Consulta já está cancelada');
    }

    const manager =
      await this.repository.findManagerProfileByUserId(managerUserId);

    if (!manager) {
      throw new NotFoundException('Perfil de gestor não encontrado');
    }

    const notes = reason
      ? `[CANCELADO PELO GESTOR] ${reason}`
      : '[CANCELADO PELO GESTOR]';

    return this.repository.cancelAppointmentByManager(
      appointmentId,
      manager.id,
      notes,
    );
  }

  async getAppointmentsByManager() {
    return this.repository.findAllAppointmentsForManager();
  }

  async getProfessionalAvailability(professionalId: string) {
    const professional =
      await this.repository.findProfessionalWithSpecialities(professionalId);

    if (!professional || professional.role !== UserRole.PROFESSIONAL) {
      throw new NotFoundException('Profissional não encontrado');
    }

    const availability =
      await this.repository.findActiveAvailabilityByProfessionalId(
        professionalId,
      );

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
