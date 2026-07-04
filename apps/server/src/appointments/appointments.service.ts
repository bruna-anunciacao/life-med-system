import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
  Inject,
} from '@nestjs/common';
import { AppointmentsRepository } from './appointments.repository';
import { MailService } from '../mail/mail.service';
import { MEET_SERVICE } from '../common/interfaces/MeetEventInterfaces';
import type { MeetService } from '../common/interfaces/MeetEventInterfaces';
import {
  CreateAppointmentPatientDto,
  CreateAppointmentPatientForManagerDto,
  ListAppointmentsQueryDto,
  CancelAppointmentDto,
  AppointmentResponseDto,
  AvailableSlotsQueryDto,
  UpdateAppointmentStatusDto,
} from './dto';
import { AppointmentStatus } from '@prisma/client';
import { APPOINTMENT_DURATION_MINUTES } from './appointment.constants';

const MIN_CANCEL_ADVANCE_HOURS = 6;
type AppointmentForResponse = Awaited<
  ReturnType<AppointmentsRepository['createPatientAppointment']>
>;

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
};

const formatMinutesAsTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
};

const dateToMinutes = (date: Date) => date.getHours() * 60 + date.getMinutes();

const intervalsOverlap = (
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number,
) => firstStart < secondEnd && firstEnd > secondStart;

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private repository: AppointmentsRepository,
    private mailService: MailService,
    @Inject(MEET_SERVICE) private meetService: MeetService,
  ) {}

  async createAppointment(
    patientId: string,
    dto: CreateAppointmentPatientDto,
  ): Promise<AppointmentResponseDto> {
    const appointmentDate = new Date(dto.dateTime);

    const appointment = await this.repository.createPatientAppointment(
      patientId,
      dto,
      appointmentDate,
    );

    this.logger.log(`Agendamento criado com sucesso: ${appointment.id}`);

    return this.finalizeCreatedAppointment(appointment);
  }

  async listPatientAppointments(
    patientId: string,
    query: ListAppointmentsQueryDto,
  ) {
    const { appointments, total, page, limit } =
      await this.repository.listPatientAppointments(patientId, query);

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
    const { appointments, total, page, limit } =
      await this.repository.listProfessionalAppointments(professionalId, query);

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
    const appointment =
      await this.repository.findAppointmentById(appointmentId);

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

    const updated = await this.repository.cancelAppointment(
      appointmentId,
      updatedNotes,
    );

    this.logger.log(
      `Agendamento ${appointmentId} cancelado por: ${dto.reason || 'sem motivo'}`,
    );

    if (updated.googleEventId) {
      try {
        await this.meetService.cancelMeetEvent(updated.googleEventId);
      } catch (err) {
        this.logger.error(
          `Falha ao cancelar evento no Google Calendar: ${(err as Error).message}`,
        );
      }
    }

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
    const appointment =
      await this.repository.findAppointmentById(appointmentId);

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

    // Consulta já realizada não pode ser revertida para "faltou"
    if (
      appointment.status === AppointmentStatus.COMPLETED &&
      dto.status === AppointmentStatus.NO_SHOW
    ) {
      throw new BadRequestException(
        'Não é possível marcar como "não compareceu" uma consulta já realizada',
      );
    }

    const updated = await this.repository.updateAppointmentStatus(
      appointmentId,
      dto,
    );

    this.logger.log(
      `Agendamento ${appointmentId} status atualizado para ${dto.status} pelo profissional ${professionalId}`,
    );

    return this.mapToResponseDto(updated);
  }

  async getAvailableSlots(
    professionalId: string,
    query: AvailableSlotsQueryDto,
  ) {
    const professional =
      await this.repository.findProfessionalById(professionalId);

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado');
    }

    const targetDate = new Date(query.date + 'T00:00:00');
    const dayOfWeek = targetDate.getDay();

    const availability = await this.repository.findAvailabilityForSlots(
      professionalId,
      dayOfWeek,
      targetDate,
    );

    if (!availability) {
      return {
        professionalId,
        date: query.date,
        appointmentDurationMinutes: APPOINTMENT_DURATION_MINUTES,
        slots: [],
      };
    }

    const startMinutes = timeToMinutes(availability.startTime);
    const endMinutes = timeToMinutes(availability.endTime);

    const dayStart = new Date(query.date + 'T00:00:00');
    const dayEnd = new Date(query.date + 'T23:59:59');

    const existingAppointments = await this.repository.findBookedTimes(
      professionalId,
      dayStart,
      dayEnd,
    );

    const bookedIntervals = existingAppointments.map((a) => {
      const start = dateToMinutes(a.dateTime);
      return { start, end: start + APPOINTMENT_DURATION_MINUTES };
    });

    const blocks = await this.repository.findScheduleBlocksForDate(
      professionalId,
      query.date,
    );

    const slots: { time: string; available: boolean }[] = [];
    for (
      let slotStart = startMinutes;
      slotStart + APPOINTMENT_DURATION_MINUTES <= endMinutes;
      slotStart += APPOINTMENT_DURATION_MINUTES
    ) {
      const time = formatMinutesAsTime(slotStart);
      const slotEnd = slotStart + APPOINTMENT_DURATION_MINUTES;

      const isBooked = bookedIntervals.some((booked) =>
        intervalsOverlap(slotStart, slotEnd, booked.start, booked.end),
      );

      let isBlocked = false;
      for (const b of blocks) {
        if (!b.startTime || !b.endTime) {
          isBlocked = true;
          break;
        }

        const blockStart = timeToMinutes(b.startTime);
        const blockEnd = timeToMinutes(b.endTime);
        if (intervalsOverlap(slotStart, slotEnd, blockStart, blockEnd)) {
          isBlocked = true;
          break;
        }
      }

      slots.push({ time, available: !isBooked && !isBlocked });
    }

    return {
      professionalId,
      date: query.date,
      appointmentDurationMinutes: APPOINTMENT_DURATION_MINUTES,
      slots,
    };
  }

  async createAppointmentByManager(
    managerUserId: string,
    dto: CreateAppointmentPatientForManagerDto,
  ): Promise<AppointmentResponseDto> {
    const appointmentDate = new Date(dto.dateTime);

    const appointment = await this.repository.createAppointmentByManager(
      managerUserId,
      dto,
      appointmentDate,
    );

    this.logger.log(
      `Agendamento criado pelo gestor ${managerUserId}: ${appointment.id}`,
    );

    return this.finalizeCreatedAppointment(appointment);
  }

  private async finalizeCreatedAppointment(
    createdAppointment: AppointmentForResponse,
  ): Promise<AppointmentResponseDto> {
    let appointment = createdAppointment;
    let meetLink: string | null = appointment.meetLink ?? null;

    if (appointment.modality === 'VIRTUAL') {
      try {
        const endDate = new Date(
          appointment.dateTime.getTime() + APPOINTMENT_DURATION_MINUTES * 60000,
        );
        const meet = await this.meetService.createMeetEvent({
          requestId: appointment.id,
          summary: `Consulta - ${appointment.professional.name}`,
          description: appointment.notes ?? undefined,
          startISO: appointment.dateTime.toISOString(),
          endISO: endDate.toISOString(),
          attendees: [
            {
              email: appointment.patient.email,
              displayName: appointment.patient.name,
            },
            {
              email: appointment.professional.email,
              displayName: appointment.professional.name,
            },
          ],
        });

        appointment = await this.repository.updateMeetData(
          appointment.id,
          meet.meetLink,
          meet.eventId,
        );
        meetLink = meet.meetLink;
      } catch (err) {
        this.logger.error(
          `Falha ao criar evento no Google Calendar: ${(err as Error).message}`,
        );
      }
    }

    await Promise.all([
      this.mailService.sendAppointmentCreatedPatientEmail(
        { name: appointment.patient.name, email: appointment.patient.email },
        {
          professionalName: appointment.professional.name,
          dateTime: appointment.dateTime,
          modality: appointment.modality,
          meetLink,
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
          meetLink,
        },
      ),
    ]).catch((err) =>
      this.logger.error(
        `Falha ao enviar emails de agendamento: ${err.message}`,
      ),
    );

    return this.mapToResponseDto(appointment);
  }

  private mapToResponseDto(appointment: any): AppointmentResponseDto {
    return {
      id: appointment.id,
      dateTime: appointment.dateTime,
      status: appointment.status,
      notes: appointment.notes,
      modality: appointment.modality,
      meetLink: appointment.meetLink ?? null,
      createdAt: appointment.createdAt,
      professional: {
        id: appointment.professional.id,
        name: appointment.professional.name,
        email: appointment.professional.email,
        specialties:
          appointment.professional.professionalProfile?.specialities?.map(
            (s: { name: string }) => s.name,
          ) ?? [],
        photoUrl:
          appointment.professional.professionalProfile?.photoUrl ?? null,
        bio: appointment.professional.professionalProfile?.bio ?? null,
      },
      patient: {
        id: appointment.patient.id,
        name: appointment.patient.name,
        email: appointment.patient.email,
      },
    };
  }
}
