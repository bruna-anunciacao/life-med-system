import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfessionalSettingsDto } from './dto/update-setting.dto';
import { CreateScheduleBlockDto } from './dto/schedule-block.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ProfessionalService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async getSettings(userId: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
      select: {
        modality: true,
        address: true,
        payments: true,
        price: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Perfil profissional não encontrado');
    }

    const availability = await this.prisma.availability.findMany({
      where: { professionalId: userId, validUntil: null },
      orderBy: { dayOfWeek: 'asc' },
    });

    return {
      modality: profile.modality,
      address: profile.address || '',
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
    const startOfDay = new Date(`${dateString}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateString}T23:59:59.999Z`);

    const targetDate = new Date(`${dateString}T12:00:00.000Z`);
    const dayOfWeek = targetDate.getUTCDay();

    const availability = await this.prisma.availability.findFirst({
      where: {
        professionalId: userId,
        dayOfWeek,
        validFrom: { lte: endOfDay },
        OR: [{ validUntil: null }, { validUntil: { gt: startOfDay } }],
      },
      orderBy: { validFrom: 'desc' },
    });

    const appointments = await this.prisma.appointment.findMany({
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

    const scheduleBlocks = await this.prisma.scheduleBlock.findMany({
      where: {
        professionalId: userId,
        date: dateString,
      },
    });

    return {
      availability,
      scheduleBlocks,
      appointments: appointments.map((apt) => ({
        id: apt.id,
        dateTime: apt.dateTime,
        status: apt.status,
        notes: apt.notes,
        patient: {
          name: apt.patient.name,
        },
      })),
    };
  }

  async getPatients(userId: string) {
    const appointments = await this.prisma.appointment.findMany({
      where: { professionalId: userId },
      orderBy: { dateTime: 'desc' },
      select: {
        dateTime: true,
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const uniquePatients = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        phone: string;
        lastVisit: string;
      }
    >();

    for (const appt of appointments) {
      if (!uniquePatients.has(appt.patient.id)) {
        uniquePatients.set(appt.patient.id, {
          id: appt.patient.id,
          name: appt.patient.name,
          email: appt.patient.email,
          phone: (appt.patient as any).phone || 'Não informado',
          lastVisit: appt.dateTime.toISOString(),
        });
      }
    }

    return Array.from(uniquePatients.values());
  }

  async getPatientDetail(professionalId: string, patientId: string) {
    const patient = await this.prisma.user.findFirst({
      where: { id: patientId, role: 'PATIENT' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }

    const appointments = await this.prisma.appointment.findMany({
      where: { professionalId, patientId },
      orderBy: { dateTime: 'desc' },
    });

    return {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: (patient as any).phone || 'Não informado',
      history: appointments.map((apt) => ({
        id: apt.id,
        dateTime: apt.dateTime,
        status: apt.status,
        notes: apt.notes,
      })),
    };
  }

  async listAll() {
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
      },
    });
  }

  async updateSettings(userId: string, dto: UpdateProfessionalSettingsDto) {
    const { modality, availability, address, payments, price } = dto;

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

    const result = await this.prisma.$transaction(async (tx) => {
      const profile = await tx.professionalProfile.update({
        where: { userId },
        data: {
          modality,
          payments,
          price,
          ...(modality === 'CLINIC' && { address }),
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

    return result;
  }

  async createScheduleBlock(userId: string, dto: CreateScheduleBlockDto) {
    const { date, startTime, endTime } = dto;
    
    if (startTime && endTime && startTime >= endTime) {
      throw new BadRequestException('startTime deve ser anterior a endTime');
    }

    const block = await this.prisma.scheduleBlock.create({
      data: {
        professionalId: userId,
        date,
        startTime,
        endTime,
      },
    });

    // Cancel appointments overlapping with this block
    // Usando offset -03:00 (Brasil) para pegar o início e fim do dia corretamente no fuso local
    const dayStart = new Date(`${date}T00:00:00.000-03:00`);
    const dayEnd = new Date(`${date}T23:59:59.999-03:00`);
    
    // Convert DB date field (String) to check overlapping appointments
    const overlappingAppointments = await this.prisma.appointment.findMany({
      where: {
        professionalId: userId,
        status: { notIn: ['CANCELLED', 'COMPLETED'] },
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

    const appointmentsToCancel = overlappingAppointments.filter(apt => {
      if (!startTime || !endTime) return true; // Full day block
      
      const aptLocalTimeStr = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Bahia',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(apt.dateTime);
      
      return aptLocalTimeStr >= startTime && aptLocalTimeStr < endTime;
    });

    if (appointmentsToCancel.length > 0) {
      const aptIds = appointmentsToCancel.map(a => a.id);
      
      await this.prisma.appointment.updateMany({
        where: { id: { in: aptIds } },
        data: {
          status: 'CANCELLED',
          notes: 'Cancelado pelo profissional por motivo de força maior/imprevisto.',
        },
      });

      // Send emails
      for (const apt of appointmentsToCancel) {
        this.mailService.sendMassCancellationEmail(
          { name: apt.patient.name, email: apt.patient.email },
          { professionalName: apt.professional.name, dateTime: apt.dateTime }
        ).catch(err => console.error(`Failed to send mass cancellation email to ${apt.patient.email}:`, err));
      }
    }

    return block;
  }

  async getScheduleBlocks(userId: string) {
    return this.prisma.scheduleBlock.findMany({
      where: { professionalId: userId },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });
  }

  async deleteScheduleBlock(userId: string, blockId: string) {
    const block = await this.prisma.scheduleBlock.findUnique({
      where: { id: blockId },
    });

    if (!block) {
      throw new NotFoundException('Bloqueio não encontrado');
    }

    if (block.professionalId !== userId) {
      throw new BadRequestException('Sem permissão para remover este bloqueio');
    }

    await this.prisma.scheduleBlock.delete({
      where: { id: blockId },
    });

    return { message: 'Bloqueio removido com sucesso' };
  }
}
