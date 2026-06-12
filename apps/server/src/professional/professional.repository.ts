import { Injectable } from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { CreateScheduleBlockDto } from './dto/schedule-block.dto';
import { UpdateProfessionalSettingsDto } from './dto/update-setting.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfessionalRepository {
  constructor(private readonly prisma: PrismaService) {}

  findSettingsProfile(userId: string) {
    return this.prisma.professionalProfile.findUnique({
      where: { userId },
      select: {
        modality: true,
        payments: true,
        price: true,
      },
    });
  }

  findActiveAvailability(userId: string) {
    return this.prisma.availability.findMany({
      where: { professionalId: userId, validUntil: null },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  findAvailabilityForDate(
    userId: string,
    dayOfWeek: number,
    startOfDay: Date,
    endOfDay: Date,
  ) {
    return this.prisma.availability.findFirst({
      where: {
        professionalId: userId,
        dayOfWeek,
        validFrom: { lte: endOfDay },
        OR: [{ validUntil: null }, { validUntil: { gt: startOfDay } }],
      },
      orderBy: { validFrom: 'desc' },
    });
  }

  findDailyAppointments(userId: string, startOfDay: Date, endOfDay: Date) {
    return this.prisma.appointment.findMany({
      where: {
        professionalId: userId,
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        patient: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });
  }

  findScheduleBlocksByDate(userId: string, date: string) {
    return this.prisma.scheduleBlock.findMany({
      where: {
        professionalId: userId,
        date,
      },
    });
  }

  findAppointmentsWithPatients(userId: string) {
    return this.prisma.appointment.findMany({
      where: { professionalId: userId },
      orderBy: { dateTime: 'desc' },
      select: {
        dateTime: true,
        status: true,
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            cpf: true,
            patientProfile: {
              select: { phone: true },
            },
          },
        },
      },
    });
  }

  findPatientSummary(patientId: string) {
    return this.prisma.user.findFirst({
      where: { id: patientId, role: 'PATIENT' },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        patientProfile: {
          select: { phone: true },
        },
      },
    });
  }

  findPatientAppointments(professionalId: string, patientId: string) {
    return this.prisma.appointment.findMany({
      where: { professionalId, patientId },
      orderBy: { dateTime: 'desc' },
    });
  }

  listAllProfessionals() {
    return this.prisma.user.findMany({
      where: { role: 'PROFESSIONAL' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        professionalProfile: {
          include: { specialities: true },
        },
        address: true,
      },
    });
  }

  updateSettings(userId: string, dto: UpdateProfessionalSettingsDto) {
    const { modality, availability, payments, price } = dto;

    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.professionalProfile.update({
        where: { userId },
        data: {
          modality,
          payments,
          price,
        },
      });

      const now = new Date();
      const editWindowMs = 60 * 60 * 1000;

      const activeAvailabilities = await tx.availability.findMany({
        where: {
          professionalId: userId,
          validUntil: null,
        },
      });

      const idsToArchive: string[] = [];
      const idsToDelete: string[] = [];

      for (const item of activeAvailabilities) {
        if (now.getTime() - item.validFrom.getTime() < editWindowMs) {
          idsToDelete.push(item.id);
        } else {
          idsToArchive.push(item.id);
        }
      }

      if (idsToArchive.length > 0) {
        await tx.availability.updateMany({
          where: { id: { in: idsToArchive } },
          data: { validUntil: now },
        });
      }

      if (idsToDelete.length > 0) {
        await tx.availability.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      await tx.availability.createMany({
        data: availability.map((a) => ({
          professionalId: userId,
          dayOfWeek: a.dayOfWeek,
          startTime: a.start,
          endTime: a.end,
          validFrom: now,
        })),
      });

      const newAvailability = await tx.availability.findMany({
        where: {
          professionalId: userId,
          validUntil: null,
        },
        orderBy: {
          dayOfWeek: 'asc',
        },
      });

      return {
        profile,
        availability: newAvailability,
      };
    });
  }

  createScheduleBlock(userId: string, dto: CreateScheduleBlockDto) {
    const { date, startTime, endTime } = dto;

    return this.prisma.scheduleBlock.create({
      data: {
        professionalId: userId,
        date,
        startTime,
        endTime,
      },
    });
  }

  findOverlappingAppointmentsForBlock(
    userId: string,
    dayStart: Date,
    dayEnd: Date,
  ) {
    return this.prisma.appointment.findMany({
      where: {
        professionalId: userId,
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED],
        },
        dateTime: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        patient: true,
        professional: true,
      },
    });
  }

  cancelAppointmentsByProfessional(appointmentIds: string[]) {
    return this.prisma.appointment.updateMany({
      where: { id: { in: appointmentIds } },
      data: {
        status: AppointmentStatus.CANCELLED,
        notes:
          'Cancelado pelo profissional por motivo de força maior/imprevisto.',
      },
    });
  }

  findFutureScheduleBlocks(userId: string, today: string) {
    return this.prisma.scheduleBlock.findMany({
      where: {
        professionalId: userId,
        date: { gte: today },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  findScheduleBlockById(id: string) {
    return this.prisma.scheduleBlock.findUnique({
      where: { id },
    });
  }

  deleteScheduleBlock(id: string) {
    return this.prisma.scheduleBlock.delete({
      where: { id },
    });
  }
}
