import { Injectable } from '@nestjs/common';
import { AppointmentStatus, Prisma, UserRole, UserStatus } from '@prisma/client';
import { CreateScheduleBlockDto } from './dto/schedule-block.dto';
import { UpdateProfessionalSettingsDto } from './dto/update-setting.dto';
import { ListProfessionalsQueryDto } from './dto/list-professionals-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/dto/paginated-response.dto';

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
      select: {
        id: true,
        dateTime: true,
        status: true,
        modality: true,
        notes: true,
        meetLink: true,
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            patientProfile: {
              select: { phone: true },
            },
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });
  }

  countDistinctAttendedPatients(userId: string) {
    return this.prisma.appointment
      .findMany({
        where: {
          professionalId: userId,
          status: AppointmentStatus.COMPLETED,
        },
        select: { patientId: true },
        distinct: ['patientId'],
      })
      .then((rows) => rows.length);
  }

  findScheduleBlocksByDate(userId: string, date: string) {
    return this.prisma.scheduleBlock.findMany({
      where: {
        professionalId: userId,
        date,
      },
    });
  }

  /**
   * Página de pacientes distintos que já tiveram consulta com este profissional,
   * ordenados por nome. A paginação é feita sobre a lista de pacientes (não de
   * consultas), garantindo `total`/`totalPages` corretos por paciente.
   */
  async findAttendedPatientsPage(
    professionalId: string,
    page: number,
    limit: number,
  ) {
    const where: Prisma.UserWhereInput = {
      role: 'PATIENT',
      appointmentsAsPatient: { some: { professionalId } },
    };

    const [patients, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          cpf: true,
          patientProfile: { select: { phone: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { patients, total };
  }

  /**
   * Consultas (dateTime/status) de um conjunto de pacientes com este profissional,
   * usadas para calcular última/próxima visita da página atual.
   */
  findAppointmentsForPatients(professionalId: string, patientIds: string[]) {
    return this.prisma.appointment.findMany({
      where: { professionalId, patientId: { in: patientIds } },
      orderBy: { dateTime: 'desc' },
      select: {
        dateTime: true,
        status: true,
        patientId: true,
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

  async findPatientAppointments(
    professionalId: string,
    patientId: string,
    page: number,
    limit: number,
  ) {
    const where: Prisma.AppointmentWhereInput = { professionalId, patientId };

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        orderBy: { dateTime: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return { appointments, total };
  }

  /**
   * Lista profissionais visíveis para pacientes (exclui PENDING/BLOCKED, que
   * ainda não foram aprovados ou foram bloqueados) com busca/filtros
   * server-side, evitando trazer a base inteira para filtrar no cliente.
   */
  listAllProfessionals(query: ListProfessionalsQueryDto) {
    const { page, limit, search, speciality, city, state } = query;

    const where: Prisma.UserWhereInput = {
      role: UserRole.PROFESSIONAL,
      status: { notIn: [UserStatus.PENDING, UserStatus.BLOCKED] },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          {
            professionalProfile: {
              specialities: {
                some: { name: { contains: search, mode: 'insensitive' } },
              },
            },
          },
        ],
      }),
      ...(speciality && {
        professionalProfile: {
          specialities: { some: { name: { equals: speciality, mode: 'insensitive' } } },
        },
      }),
      ...((city || state) && {
        address: {
          is: {
            ...(city && { city: { equals: city, mode: 'insensitive' } }),
            ...(state && { state: { equals: state, mode: 'insensitive' } }),
          },
        },
      }),
    };

    return paginate(
      this.prisma.user,
      {
        where,
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
        orderBy: { name: 'asc' },
      },
      page,
      limit,
    );
  }

  /** Combinações distintas de cidade/estado entre profissionais visíveis, para o filtro de localização. */
  async listDistinctProfessionalLocations() {
    const rows = await this.prisma.address.findMany({
      where: {
        user: {
          role: UserRole.PROFESSIONAL,
          status: { notIn: [UserStatus.PENDING, UserStatus.BLOCKED] },
        },
      },
      select: { city: true, state: true },
      distinct: ['city', 'state'],
      orderBy: [{ state: 'asc' }, { city: 'asc' }],
    });

    return rows;
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
