import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  CreateAppointmentPatientDto,
  ListAppointmentsQueryDto,
  CancelAppointmentDto,
  AppointmentResponseDto,
  AvailableSlotsQueryDto,
  UpdateAppointmentStatusDto,
} from './dto';
import { AppointmentStatus } from '@prisma/client';

const APPOINTMENT_DURATION_MINUTES = 30;
const MIN_CANCEL_ADVANCE_HOURS = 6;

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

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

    await Promise.all([
      this.mailService.sendAppointmentCreatedPatientEmail(
        { name: appointment.patient.name, email: appointment.patient.email },
        {
          professionalName: appointment.professional.name,
          dateTime: appointment.dateTime,
          modality: appointment.modality,
        },
      ),
      this.mailService.sendAppointmentCreatedProfessionalEmail(
        {
          name: appointment.professional.name,
          email: appointment.professional.email,
        },
        {
          patientName: appointment.patient.name,
          dateTime: appointment.dateTime,
          modality: appointment.modality,
          notes: appointment.notes,
        },
      ),
    ]).catch((err) =>
      this.logger.error(
        `Falha ao enviar emails de agendamento: ${err.message}`,
      ),
    );

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

  async listProfessionalAppointments(
    professionalId: string,
    query: ListAppointmentsQueryDto,
  ) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where = {
      professionalId,
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

    const hoursUntilAppointment =
      (appointment.dateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < MIN_CANCEL_ADVANCE_HOURS) {
      throw new BadRequestException(
        `Cancelamento permitido apenas com ${MIN_CANCEL_ADVANCE_HOURS}h de antecedência`,
      );
    }

    const cancelNote = dto.reason ? `${dto.reason}` : '[CANCELADO]';

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

    await Promise.all([
      this.mailService.sendAppointmentCancelledEmail(
        { name: updated.patient.name, email: updated.patient.email },
        {
          patientName: updated.patient.name,
          professionalName: updated.professional.name,
          dateTime: updated.dateTime,
          reason: dto.reason,
        },
      ),
      this.mailService.sendAppointmentCancelledEmail(
        { name: updated.professional.name, email: updated.professional.email },
        {
          patientName: updated.patient.name,
          professionalName: updated.professional.name,
          dateTime: updated.dateTime,
          reason: dto.reason,
        },
      ),
    ]).catch((err) =>
      this.logger.error(
        `Falha ao enviar emails de cancelamento: ${err.message}`,
      ),
    );

    return this.mapToResponseDto(updated);
  }

  async updateAppointmentStatus(
    appointmentId: string,
    professionalId: string,
    dto: UpdateAppointmentStatusDto,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (appointment.professionalId !== professionalId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este agendamento',
      );
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException(
        'Não é possível alterar o status de um agendamento cancelado',
      );
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: dto.status,
        notes: dto.notes,
      },
      include: {
        patient: true,
        professional: true,
      },
    });

    this.logger.log(
      `Agendamento ${appointmentId} status atualizado para ${dto.status} pelo profissional ${professionalId}`,
    );

    return this.mapToResponseDto(updated);
  }

  async getAvailableSlots(
    professionalId: string,
    query: AvailableSlotsQueryDto,
  ) {
    const professional = await this.prisma.user.findUnique({
      where: { id: professionalId },
    });

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado');
    }

    const targetDate = new Date(query.date + 'T00:00:00');
    const dayOfWeek = targetDate.getDay();

    const availability = await this.prisma.availability.findFirst({
      where: {
        professionalId,
        dayOfWeek,
        validFrom: { lte: targetDate },
        OR: [{ validUntil: null }, { validUntil: { gte: targetDate } }],
      },
    });

    if (!availability) {
      return { professionalId, date: query.date, slots: [] };
    }

    const [startHour] = availability.startTime.split(':').map(Number);
    const [endHour] = availability.endTime.split(':').map(Number);

    const dayStart = new Date(query.date + 'T00:00:00');
    const dayEnd = new Date(query.date + 'T23:59:59');

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        professionalId,
        dateTime: { gte: dayStart, lte: dayEnd },
        status: { not: 'CANCELLED' },
      },
      select: { dateTime: true },
    });

    const bookedTimes = new Set(
      existingAppointments.map((a) => {
        const h = a.dateTime.getHours().toString().padStart(2, '0');
        const m = a.dateTime.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
      }),
    );

    const slots: { time: string; available: boolean }[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (const minutes of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        slots.push({ time, available: !bookedTimes.has(time) });
      }
    }

    return { professionalId, date: query.date, slots };
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
