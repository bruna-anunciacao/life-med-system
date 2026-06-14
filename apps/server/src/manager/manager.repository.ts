import { Injectable } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ManagerRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAppointmentById(id: string) {
    return this.prisma.appointment.findUnique({ where: { id } });
  }

  findManagerProfileByUserId(userId: string) {
    return this.prisma.managerProfile.findUnique({ where: { userId } });
  }

  cancelAppointmentByManager(
    appointmentId: string,
    managerProfileId: string,
    notes: string,
  ) {
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelledByManagerId: managerProfileId,
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

  findAllAppointmentsForManagerAndAdmin() {
    return this.prisma.appointment.findMany({
      select: {
        id: true,
        dateTime: true,
        status: true,
        notes: true,
        modality: true,
        meetLink: true,
        createdAt: true,
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            patientProfile: {
              select: {
                questionnaire: {
                  select: {
                    totalScore: true,
                    isVulnerable: true,
                  },
                },
              },
            },
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        scheduledByManager: {
          select: {
            user: { select: { name: true } },
          },
        },
        cancelledByManager: {
          select: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { dateTime: 'desc' },
    });
  }

  findProfessionalWithSpecialities(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        professionalProfile: {
          include: {
            specialities: true,
          },
        },
      },
    });
  }

  findActiveAvailabilityByProfessionalId(professionalId: string) {
    return this.prisma.availability.findMany({
      where: {
        professionalId,
        validUntil: null,
      },
      orderBy: { dayOfWeek: 'asc' },
    });
  }
}
