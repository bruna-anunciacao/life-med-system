import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import {
  CreateAppointmentPatientDto,
  ListAppointmentsQueryDto,
  UpdateAppointmentStatusDto,
} from './dto';
import { PrismaService } from '../prisma/prisma.service';

const APPOINTMENT_DURATION_MINUTES = 30;

@Injectable()
export class AppointmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createPatientAppointment(
    patientId: string,
    dto: CreateAppointmentPatientDto,
    appointmentDate: Date,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const professional = await tx.user.findUnique({
        where: { id: dto.professionalId },
        include: { professionalProfile: true },
      });

      if (!professional) {
        throw new NotFoundException('Profissional não encontrado');
      }

      await this.validateAvailability(tx, dto.professionalId, appointmentDate);

      await this.checkScheduleConflict(
        tx,
        'professionalId',
        dto.professionalId,
        appointmentDate,
        'Profissional não tem disponibilidade neste horário',
      );

      await this.checkScheduleConflict(
        tx,
        'patientId',
        patientId,
        appointmentDate,
        'Você já possui um agendamento neste horário',
      );

      return tx.appointment.create({
        data: {
          patientId,
          professionalId: dto.professionalId,
          dateTime: appointmentDate,
          notes: dto.notes,
          status: AppointmentStatus.PENDING,
          modality: professional.professionalProfile?.modality ?? 'VIRTUAL',
        },
        include: {
          patient: true,
          professional: true,
        },
      });
    });
  }

  updateMeetData(id: string, meetLink: string, googleEventId: string) {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        meetLink,
        googleEventId,
      },
      include: { patient: true, professional: true },
    });
  }

  async listPatientAppointments(
    patientId: string,
    query: ListAppointmentsQueryDto,
  ) {
    return this.listAppointments({ patientId }, query);
  }

  async listProfessionalAppointments(
    professionalId: string,
    query: ListAppointmentsQueryDto,
  ) {
    return this.listAppointments({ professionalId }, query);
  }

  findAppointmentById(id: string) {
    return this.prisma.appointment.findUnique({
      where: { id },
    });
  }

  cancelAppointment(id: string, notes: string) {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        notes,
      },
      include: {
        patient: true,
        professional: true,
      },
    });
  }

  updateAppointmentStatus(id: string, dto: UpdateAppointmentStatusDto) {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
      },
      include: {
        patient: true,
        professional: true,
      },
    });
  }

  findProfessionalById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findAvailabilityForSlots(
    professionalId: string,
    dayOfWeek: number,
    targetDate: Date,
  ) {
    return this.prisma.availability.findFirst({
      where: {
        professionalId,
        dayOfWeek,
        validFrom: { lte: targetDate },
        OR: [{ validUntil: null }, { validUntil: { gte: targetDate } }],
      },
    });
  }

  findBookedTimes(professionalId: string, dayStart: Date, dayEnd: Date) {
    return this.prisma.appointment.findMany({
      where: {
        professionalId,
        dateTime: { gte: dayStart, lte: dayEnd },
        status: { not: AppointmentStatus.CANCELLED },
      },
      select: { dateTime: true },
    });
  }

  findScheduleBlocksForDate(professionalId: string, date: string) {
    return this.prisma.scheduleBlock.findMany({
      where: {
        professionalId,
        date,
      },
    });
  }

  createAppointmentByManager(
    managerUserId: string,
    dto: CreateAppointmentPatientDto & { patientId: string },
    appointmentDate: Date,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const patient = await tx.user.findUnique({
        where: { id: dto.patientId },
      });

      if (!patient) {
        throw new NotFoundException('Paciente não encontrado');
      }

      const professional = await tx.user.findUnique({
        where: { id: dto.professionalId },
      });

      if (!professional) {
        throw new NotFoundException('Profissional não encontrado');
      }

      const manager = await tx.managerProfile.findUnique({
        where: { userId: managerUserId },
      });

      if (!manager) {
        throw new ForbiddenException('Perfil de gestor não encontrado');
      }

      await this.validateAvailability(tx, dto.professionalId, appointmentDate);

      await this.checkScheduleConflict(
        tx,
        'professionalId',
        dto.professionalId,
        appointmentDate,
        'Profissional não tem disponibilidade neste horário',
      );

      await this.checkScheduleConflict(
        tx,
        'patientId',
        dto.patientId,
        appointmentDate,
        'Paciente já possui um agendamento neste horário',
      );

      return tx.appointment.create({
        data: {
          patientId: dto.patientId,
          professionalId: dto.professionalId,
          dateTime: appointmentDate,
          notes: dto.notes,
          status: AppointmentStatus.PENDING,
          scheduledByManagerId: manager.id,
        },
        include: {
          patient: true,
          professional: true,
          scheduledByManager: { include: { user: true } },
        },
      });
    });
  }

  private async listAppointments(
    ownerFilter:
      | { patientId: string; professionalId?: never }
      | { professionalId: string; patientId?: never },
    query: ListAppointmentsQueryDto,
  ) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where = {
      ...ownerFilter,
      ...(query.status && { status: query.status }),
      ...(query.startDate || query.endDate
        ? {
            dateTime: {
              ...(query.startDate && { gte: new Date(query.startDate) }),
              ...(query.endDate && { lte: new Date(query.endDate) }),
            },
          }
        : {}),
    };

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: {
          patient: true,
          professional: {
            include: {
              professionalProfile: {
                include: { specialities: true },
              },
            },
          },
        },
        orderBy: { dateTime: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return { appointments, total, page, limit };
  }

  private async validateAvailability(
    tx: Prisma.TransactionClient,
    professionalId: string,
    appointmentDate: Date,
  ) {
    const dayOfWeek = appointmentDate.getDay();
    const appointmentHour = appointmentDate.getHours();

    const availability = await tx.availability.findFirst({
      where: {
        professionalId,
        dayOfWeek,
        validFrom: { lte: appointmentDate },
        OR: [{ validUntil: null }, { validUntil: { gte: appointmentDate } }],
      },
    });

    if (!availability) {
      throw new BadRequestException(
        'Profissional não tem disponibilidade neste dia da semana',
      );
    }

    const [startHour] = availability.startTime.split(':').map(Number);
    const [endHour] = availability.endTime.split(':').map(Number);

    if (appointmentHour < startHour || appointmentHour >= endHour) {
      throw new BadRequestException(
        `Horário fora da disponibilidade. Disponível entre ${availability.startTime} e ${availability.endTime}`,
      );
    }

    const blocks = await tx.scheduleBlock.findMany({
      where: {
        professionalId,
        date: appointmentDate.toISOString().split('T')[0],
      },
    });

    const aptTimeStr = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Bahia',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(appointmentDate);

    for (const b of blocks) {
      if (!b.startTime || !b.endTime) {
        throw new BadRequestException(
          'Profissional não tem disponibilidade neste dia (agenda bloqueada)',
        );
      }
      if (aptTimeStr >= b.startTime && aptTimeStr < b.endTime) {
        throw new BadRequestException(
          `Horário bloqueado pelo profissional (das ${b.startTime} às ${b.endTime})`,
        );
      }
    }
  }

  private async checkScheduleConflict(
    tx: Prisma.TransactionClient,
    field: 'professionalId' | 'patientId',
    userId: string,
    appointmentDate: Date,
    errorMessage: string,
  ) {
    const endTime = new Date(
      appointmentDate.getTime() + APPOINTMENT_DURATION_MINUTES * 60000,
    );
    const startBuffer = new Date(
      appointmentDate.getTime() - APPOINTMENT_DURATION_MINUTES * 60000,
    );

    const conflict = await tx.appointment.findFirst({
      where: {
        [field]: userId,
        dateTime: {
          gte: startBuffer,
          lt: endTime,
        },
        status: { not: AppointmentStatus.CANCELLED },
      },
    });

    if (conflict) {
      throw new BadRequestException(errorMessage);
    }
  }
}
