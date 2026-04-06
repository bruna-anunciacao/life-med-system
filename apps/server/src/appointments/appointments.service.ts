import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto';
import { AvailableSlotsQueryDto } from './dto/available-slots-query.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateSlots(
    startTime: string,
    endTime: string,
    durationMin = 60,
  ): string[] {
    const slots: string[] = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + durationMin <= end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      current += durationMin;
    }

    return slots;
  }

  async getAvailableSlots(dto: AvailableSlotsQueryDto): Promise<string[]> {
    const date = new Date(dto.date + 'T00:00:00Z');
    const dayOfWeek = date.getUTCDay();
    const today = new Date();

    const availability = await this.prisma.availability.findFirst({
      where: {
        professionalId: dto.professionalId,
        dayOfWeek,
        validFrom: { lte: today },
        OR: [{ validUntil: null }, { validUntil: { gte: today } }],
      },
      orderBy: { validFrom: 'desc' },
    });

    if (!availability) return [];

    const allSlots = this.generateSlots(
      availability.startTime,
      availability.endTime,
    );

    const dayStart = new Date(dto.date + 'T00:00:00Z');
    const dayEnd = new Date(dto.date + 'T23:59:59Z');

    const bookedAppointments = await this.prisma.appointment.findMany({
      where: {
        professionalId: dto.professionalId,
        dateTime: { gte: dayStart, lte: dayEnd },
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
      },
      select: { dateTime: true },
    });

    const bookedTimes = new Set(
      bookedAppointments.map((a) => {
        const d = new Date(a.dateTime);
        return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
      }),
    );

    const nowUTC = new Date();
    const isToday = dto.date === nowUTC.toISOString().slice(0, 10);

    return allSlots.filter((slot) => {
      if (bookedTimes.has(slot)) return false;
      if (isToday) {
        const [h, m] = slot.split(':').map(Number);
        const slotDate = new Date(dto.date + 'T00:00:00Z');
        slotDate.setUTCHours(h, m, 0, 0);
        if (slotDate <= nowUTC) return false;
      }
      return true;
    });
  }

  async createAppointment(patientId: string, dto: CreateAppointmentDto) {
    const dateTime = new Date(dto.dateTime);

    if (dateTime <= new Date()) {
      throw new BadRequestException('O horário deve ser no futuro.');
    }

    const date = dto.dateTime.slice(0, 10);
    const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay();
    const today = new Date();

    const availability = await this.prisma.availability.findFirst({
      where: {
        professionalId: dto.professionalId,
        dayOfWeek,
        validFrom: { lte: today },
        OR: [{ validUntil: null }, { validUntil: { gte: today } }],
      },
    });

    if (!availability) {
      throw new BadRequestException(
        'O profissional não tem disponibilidade neste dia.',
      );
    }

    const slotTime = `${String(dateTime.getUTCHours()).padStart(2, '0')}:${String(dateTime.getUTCMinutes()).padStart(2, '0')}`;
    const slots = this.generateSlots(
      availability.startTime,
      availability.endTime,
    );

    if (!slots.includes(slotTime)) {
      throw new BadRequestException(
        'O horário solicitado não está disponível.',
      );
    }

    const professionalConflict = await this.prisma.appointment.findFirst({
      where: {
        professionalId: dto.professionalId,
        dateTime,
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
      },
    });

    if (professionalConflict) {
      throw new ConflictException('Horário já ocupado.');
    }

    const patientConflict = await this.prisma.appointment.findFirst({
      where: {
        patientId,
        dateTime,
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
      },
    });

    if (patientConflict) {
      throw new ConflictException(
        'Você já tem uma consulta agendada neste horário.',
      );
    }

    return this.prisma.appointment.create({
      data: {
        professionalId: dto.professionalId,
        patientId,
        dateTime,
        modality: dto.modality,
        notes: dto.notes,
        status: AppointmentStatus.PENDING,
      },
    });
  }

  async listMyAppointments(patientId: string, query: ListAppointmentsQueryDto) {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        patientId,
        ...(query.status ? { status: query.status } : {}),
      },
      include: {
        professional: {
          select: {
            name: true,
            professionalProfile: {
              select: { specialty: true },
            },
          },
        },
      },
      orderBy: { dateTime: 'asc' },
    });

    return appointments.map((a) => ({
      id: a.id,
      professionalId: a.professionalId,
      doctorName: a.professional.name,
      specialty: a.professional.professionalProfile?.specialty ?? '',
      dateTime: a.dateTime.toISOString(),
      status: a.status,
      modality: a.modality,
      notes: a.notes ?? undefined,
    }));
  }

  async cancelAppointment(patientId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, patientId },
    });

    if (!appointment) {
      throw new NotFoundException('Consulta não encontrada.');
    }

    const cancellableStatuses: AppointmentStatus[] = [
      AppointmentStatus.PENDING,
      AppointmentStatus.CONFIRMED,
    ];

    if (!cancellableStatuses.includes(appointment.status)) {
      throw new BadRequestException(
        'Consulta não pode ser cancelada neste status.',
      );
    }

    const now = new Date();
    const diff = appointment.dateTime.getTime() - now.getTime();
    const hoursUntil = diff / (1000 * 60 * 60);

    if (hoursUntil < 24) {
      throw new BadRequestException(
        'O cancelamento deve ser feito com pelo menos 24 horas de antecedência.',
      );
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED },
    });
  }
}
