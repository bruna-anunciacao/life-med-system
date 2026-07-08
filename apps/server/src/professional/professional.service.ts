import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { ProfessionalRepository } from './professional.repository';
import { UpdateProfessionalSettingsDto } from './dto/update-setting.dto';
import { CreateScheduleBlockDto } from './dto/schedule-block.dto';
import { MailService } from '../mail/mail.service';
import { MEET_SERVICE } from '../common/interfaces/MeetEventInterfaces';
import type { MeetService } from '../common/interfaces/MeetEventInterfaces';
import { APPOINTMENT_DURATION_MINUTES } from '../appointments/appointment.constants';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ListProfessionalsQueryDto } from './dto/list-professionals-query.dto';
import { buildMeta } from '../common/dto/paginated-response.dto';

@Injectable()
export class ProfessionalService {
  constructor(
    private repository: ProfessionalRepository,
    private mailService: MailService,
    @Inject(MEET_SERVICE) private meetService: MeetService,
  ) {}

  async getSettings(userId: string) {
    const profile = await this.repository.findSettingsProfile(userId);

    if (!profile) {
      throw new NotFoundException('Perfil profissional não encontrado');
    }

    const availability = await this.repository.findActiveAvailability(userId);

    return {
      modality: profile.modality,
      payments: profile.payments || ['pix'],
      price: profile.price || 0,
      availability: availability.map((a) => ({
        dayOfWeek: a.dayOfWeek,
        start: a.startTime,
        end: a.endTime,
      })),
    };
  }

  async getDailySchedule(userId: string, dateString: string) {
    // Usando offset -03:00 (Brasil) para pegar o início e fim do dia no fuso local.
    const startOfDay = new Date(`${dateString}T00:00:00.000-03:00`);
    const endOfDay = new Date(`${dateString}T23:59:59.999-03:00`);

    const targetDate = new Date(`${dateString}T12:00:00.000-03:00`);
    const dayOfWeek = targetDate.getDay();

    const availability = await this.repository.findAvailabilityForDate(
      userId,
      dayOfWeek,
      startOfDay,
      endOfDay,
    );

    const appointments = await this.repository.findDailyAppointments(
      userId,
      startOfDay,
      endOfDay,
    );

    const scheduleBlocks = await this.repository.findScheduleBlocksByDate(
      userId,
      dateString,
    );

    const attendedPatientsCount =
      await this.repository.countDistinctAttendedPatients(userId);

    return {
      availability,
      scheduleBlocks,
      attendedPatientsCount,
      appointmentDurationMinutes: APPOINTMENT_DURATION_MINUTES,
      appointments: appointments.map((apt) => ({
        id: apt.id,
        dateTime: apt.dateTime,
        status: apt.status,
        modality: apt.modality,
        notes: apt.notes,
        meetLink: apt.meetLink,
        patient: {
          id: apt.patient.id,
          name: apt.patient.name,
          email: apt.patient.email,
          phone: apt.patient.patientProfile?.phone ?? null,
        },
      })),
    };
  }

  async getPatients(userId: string, query: PaginationQueryDto) {
    const { page, limit } = query;

    const { patients, total } =
      await this.repository.findAttendedPatientsPage(userId, page, limit);

    if (patients.length === 0) {
      return { data: [], meta: buildMeta(total, page, limit) };
    }

    const patientIds = patients.map((p) => p.id);
    const appointments = await this.repository.findAppointmentsForPatients(
      userId,
      patientIds,
    );

    const now = new Date();
    const visits = new Map<
      string,
      { lastVisit: string | null; nextVisit: string | null }
    >();

    for (const appt of appointments) {
      const existing = visits.get(appt.patientId) ?? {
        lastVisit: null as string | null,
        nextVisit: null as string | null,
      };

      const isUpcoming =
        appt.dateTime > now &&
        (appt.status === AppointmentStatus.PENDING ||
          appt.status === AppointmentStatus.CONFIRMED);

      if (isUpcoming) {
        if (
          !existing.nextVisit ||
          new Date(existing.nextVisit) > appt.dateTime
        ) {
          existing.nextVisit = appt.dateTime.toISOString();
        }
      } else {
        if (
          !existing.lastVisit ||
          new Date(existing.lastVisit) < appt.dateTime
        ) {
          existing.lastVisit = appt.dateTime.toISOString();
        }
      }

      visits.set(appt.patientId, existing);
    }

    const data = patients.map((patient) => {
      const patientVisits = visits.get(patient.id) ?? {
        lastVisit: null,
        nextVisit: null,
      };

      return {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        cpf: patient.cpf ?? null,
        phone: patient.patientProfile?.phone || 'Não informado',
        lastVisit: patientVisits.lastVisit,
        nextVisit: patientVisits.nextVisit,
      };
    });

    return { data, meta: buildMeta(total, page, limit) };
  }

  async getPatientDetail(
    professionalId: string,
    patientId: string,
    query: PaginationQueryDto,
  ) {
    const patient = await this.repository.findPatientSummary(patientId);

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }

    const { page, limit } = query;
    const { appointments, total } =
      await this.repository.findPatientAppointments(
        professionalId,
        patientId,
        page,
        limit,
      );

    return {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      cpf: patient.cpf ?? null,
      phone: patient.patientProfile?.phone || 'Não informado',
      history: {
        data: appointments.map((apt) => ({
          id: apt.id,
          dateTime: apt.dateTime,
          status: apt.status,
          modality: apt.modality,
          notes: apt.notes,
        })),
        meta: buildMeta(total, page, limit),
      },
    };
  }

  listAll(query: ListProfessionalsQueryDto) {
    return this.repository.listAllProfessionals(query);
  }

  async listLocations() {
    const rows = await this.repository.listDistinctProfessionalLocations();
    return rows.map((row) => ({ city: row.city, state: row.state }));
  }

  async updateSettings(userId: string, dto: UpdateProfessionalSettingsDto) {
    const { modality, availability, payments, price } = dto;

    if (!availability.length) {
      throw new BadRequestException('At least one availability is required');
    }

    const days = availability.map((a) => a.dayOfWeek);
    const uniqueDays = new Set(days);

    if (days.length !== uniqueDays.size) {
      throw new BadRequestException('Duplicate dayOfWeek in availability');
    }

    for (const slot of availability) {
      if (slot.start >= slot.end) {
        throw new BadRequestException(
          `Invalid time range for day ${slot.dayOfWeek}`,
        );
      }
    }

    const result = await this.repository.updateSettings(userId, dto);

    return result;
  }

  async createScheduleBlock(userId: string, dto: CreateScheduleBlockDto) {
    const { date, startTime, endTime } = dto;

    if (startTime && endTime && startTime >= endTime) {
      throw new BadRequestException('startTime deve ser anterior a endTime');
    }

    const block = await this.repository.createScheduleBlock(userId, dto);

    // Cancel appointments overlapping with this block
    // Usando offset -03:00 (Brasil) para pegar o início e fim do dia corretamente no fuso local
    const dayStart = new Date(`${date}T00:00:00.000-03:00`);
    const dayEnd = new Date(`${date}T23:59:59.999-03:00`);

    // Convert DB date field (String) to check overlapping appointments
    const overlappingAppointments =
      await this.repository.findOverlappingAppointmentsForBlock(
        userId,
        dayStart,
        dayEnd,
      );

    const appointmentsToCancel = overlappingAppointments.filter((apt) => {
      if (!startTime || !endTime) return true; // Full day block

      const aptLocalTimeStr = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Bahia',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(apt.dateTime);

      return aptLocalTimeStr >= startTime && aptLocalTimeStr < endTime;
    });

    if (appointmentsToCancel.length > 0) {
      const aptIds = appointmentsToCancel.map((a) => a.id);

      await this.repository.cancelAppointmentsByProfessional(aptIds);

      for (const apt of appointmentsToCancel) {
        if (apt.googleEventId) {
          this.meetService
            .cancelMeetEvent(apt.googleEventId)
            .catch((err) =>
              console.error(
                `Failed to cancel Google Calendar event for appointment ${apt.id}:`,
                err,
              ),
            );
        }

        this.mailService
          .sendMassCancellationEmail(
            { name: apt.patient.name, email: apt.patient.email },
            { professionalName: apt.professional.name, dateTime: apt.dateTime },
          )
          .catch((err) =>
            console.error(
              `Failed to send mass cancellation email to ${apt.patient.email}:`,
              err,
            ),
          );
      }
    }

    return block;
  }

  async getScheduleBlocks(userId: string) {
    // Pegar a data de hoje no fuso do Brasil (YYYY-MM-DD)
    const todayStr = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Bahia',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .format(new Date())
      .split('/')
      .reverse()
      .join('-'); // converte DD/MM/YYYY para YYYY-MM-DD

    return this.repository.findFutureScheduleBlocks(userId, todayStr);
  }

  async deleteScheduleBlock(userId: string, blockId: string) {
    const block = await this.repository.findScheduleBlockById(blockId);

    if (!block) {
      throw new NotFoundException('Bloqueio não encontrado');
    }

    if (block.professionalId !== userId) {
      throw new BadRequestException('Sem permissão para remover este bloqueio');
    }

    await this.repository.deleteScheduleBlock(blockId);

    return { message: 'Bloqueio removido com sucesso' };
  }
}
