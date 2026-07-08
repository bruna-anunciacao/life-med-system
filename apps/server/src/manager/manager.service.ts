import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, UserRole } from '@prisma/client';
import { ManagerRepository } from './manager.repository';
import { ListManagerAppointmentsQueryDto } from './dtos/list-manager-appointments-query.dto';

@Injectable()
export class ManagerService {
  constructor(private repository: ManagerRepository) {}

  async cancelAppointment(
    managerUserId: string,
    appointmentId: string,
    reason?: string,
  ) {
    const appointment = await this.repository.findAppointmentById(appointmentId);

    if (!appointment) {
      throw new NotFoundException('Consulta não encontrada');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Consulta já está cancelada');
    }

    const manager = await this.repository.findManagerProfileByUserId(
      managerUserId,
    );

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
    const { data, meta } =
      await this.repository.findAllAppointmentsForManagerAndAdmin(query);

    return {
      data: data.map((appt) => {
        const questionnaire = appt.patient.patientProfile?.questionnaire;

        return {
          id: appt.id,
          dateTime: appt.dateTime,
          status: appt.status,
          notes: appt.notes,
          modality: appt.modality,
          meetLink: appt.meetLink,
          createdAt: appt.createdAt,
          patient: {
            id: appt.patient.id,
            name: appt.patient.name,
            email: appt.patient.email,
          },
          professional: {
            id: appt.professional.id,
            name: appt.professional.name,
            email: appt.professional.email,
          },
          scheduledByManagerName: appt.scheduledByManager?.user.name ?? null,
          cancelledByManagerName: appt.cancelledByManager?.user.name ?? null,
          vulnerabilityScore: questionnaire?.totalScore ?? null,
          isVulnerable: questionnaire?.isVulnerable ?? false,
        };
      }),
      meta,
    };
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
