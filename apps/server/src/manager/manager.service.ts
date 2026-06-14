import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ManagerRepository } from './manager.repository';
import { AppointmentStatus, UserRole } from '@prisma/client';
import { ListManagerAppointmentsQueryDto } from './dtos/list-manager-appointments-query.dto';

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

  async listAppointments(query: ListManagerAppointmentsQueryDto) {
    const appointments =
      await this.repository.findAllAppointmentsForManagerAndAdmin();

    const response = appointments.map((appointment) => ({
      id: appointment.id,
      dateTime: appointment.dateTime,
      status: appointment.status,
      notes: appointment.notes,
      modality: appointment.modality,
      meetLink: appointment.meetLink,
      createdAt: appointment.createdAt,
      patient: {
        id: appointment.patient.id,
        name: appointment.patient.name,
        email: appointment.patient.email,
      },
      professional: appointment.professional,
      scheduledByManager: appointment.scheduledByManager,
      cancelledByManager: appointment.cancelledByManager,
      totalScore:
        appointment.patient.patientProfile?.questionnaire?.totalScore ?? null,
      isVulnerable:
        appointment.patient.patientProfile?.questionnaire?.isVulnerable ?? null,
    }));

    if (query.sortBy !== 'vulnerabilityScore') {
      return response;
    }

    const direction = query.order === 'desc' ? -1 : 1;

    return response.sort((left, right) => {
      if (left.totalScore === null && right.totalScore === null) {
        return right.dateTime.getTime() - left.dateTime.getTime();
      }
      if (left.totalScore === null) return 1;
      if (right.totalScore === null) return -1;

      const scoreDifference = (left.totalScore - right.totalScore) * direction;
      return (
        scoreDifference || right.dateTime.getTime() - left.dateTime.getTime()
      );
    });
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
