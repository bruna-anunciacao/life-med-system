import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAppointmentPatientDto,
  ListAppointmentsQueryDto,
  CancelAppointmentDto,
  AppointmentResponseDto,
} from './dto';

const APPOINTMENT_DURATION_MINUTES = 30;

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(private prisma: PrismaService) {}

  async createAppointment(
    patientId: string,
    dto: CreateAppointmentPatientDto,
  ): Promise<AppointmentResponseDto> {
    const appointmentDate = new Date(dto.dateTime);

    const appointment = await this.prisma.$transaction(async (tx) => {
      const professional = await tx.user.findUnique({
        where: { id: dto.professionalId },
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
          status: 'PENDING',
        },
        include: {
          patient: true,
          professional: true,
        },
      });
    });

    this.logger.log(`Agendamento criado com sucesso: ${appointment.id}`);
    return this.mapToResponseDto(appointment);
  }

  private async validateAvailability(
    tx: any,
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
  }

  private async checkScheduleConflict(
    tx: any,
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
        status: { not: 'CANCELLED' },
      },
    });

    if (conflict) {
      throw new BadRequestException(errorMessage);
    }
  }

  async listPatientAppointments(
    patientId: string,
    query: ListAppointmentsQueryDto,
  ) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where = {
      patientId,
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
          professional: true,
        },
        orderBy: { dateTime: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments.map((a) => this.mapToResponseDto(a)),
      page,
      limit,
      total,
    };
  }

  async cancelAppointment(
    appointmentId: string,
    dto: CancelAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (appointment.status === 'CANCELLED') {
      throw new BadRequestException('Agendamento já foi cancelado');
    }

    const cancelNote = dto.reason ? `[CANCELADO] ${dto.reason}` : '[CANCELADO]';

    const updatedNotes = appointment.notes
      ? `${appointment.notes}\n${cancelNote}`
      : cancelNote;

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'CANCELLED',
        notes: updatedNotes,
      },
      include: {
        patient: true,
        professional: true,
      },
    });

    this.logger.log(
      `Agendamento ${appointmentId} cancelado por: ${dto.reason || 'sem motivo'}`,
    );

    return this.mapToResponseDto(updated);
  }

  private mapToResponseDto(appointment: any): AppointmentResponseDto {
    return {
      id: appointment.id,
      dateTime: appointment.dateTime,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      professional: {
        id: appointment.professional.id,
        name: appointment.professional.name,
        email: appointment.professional.email,
      },
      patient: {
        id: appointment.patient.id,
        name: appointment.patient.name,
        email: appointment.patient.email,
      },
    };
  }
}
