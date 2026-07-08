import { Injectable } from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListManagerAppointmentsQueryDto } from './dtos/list-manager-appointments-query.dto';
import {
  buildMeta,
  PaginatedResult,
} from '../common/dto/paginated-response.dto';

const MANAGER_APPOINTMENT_SELECT = {
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
} satisfies Prisma.AppointmentSelect;

export type ManagerAppointmentRow = Prisma.AppointmentGetPayload<{
  select: typeof MANAGER_APPOINTMENT_SELECT;
}>;

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

  async findAllAppointmentsForManagerAndAdmin(
    query: ListManagerAppointmentsQueryDto,
  ): Promise<PaginatedResult<ManagerAppointmentRow>> {
    const { page, limit } = query;
    const orderBy = this.buildAppointmentsOrderBy(query);

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        select: MANAGER_APPOINTMENT_SELECT,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.appointment.count(),
    ]);

    return { data, meta: buildMeta(total, page, limit) };
  }

  /**
   * Ordenação por vulnerabilidade resolvida no banco (não em memória), para
   * funcionar corretamente através de todas as páginas.
   *
   * Ordena pela nota do questionário do paciente (relação to-one) e usa
   * `dateTime desc` como critério de desempate — o mesmo comportamento do antigo
   * sort em memória. Pacientes sem questionário (totalScore NULL) seguem a
   * colocação padrão do PostgreSQL (NULLs por último em asc), preservando a
   * ordenação consistente entre páginas.
   */
  private buildAppointmentsOrderBy(
    query: ListManagerAppointmentsQueryDto,
  ): Prisma.AppointmentOrderByWithRelationInput[] {
    if (query.sortBy !== 'vulnerabilityScore') {
      return [{ dateTime: 'desc' }];
    }

    const direction: Prisma.SortOrder = query.order === 'desc' ? 'desc' : 'asc';

    return [
      {
        patient: {
          patientProfile: {
            questionnaire: {
              totalScore: direction,
            },
          },
        },
      },
      { dateTime: 'desc' },
    ];
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
