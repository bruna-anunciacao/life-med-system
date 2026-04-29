import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfessionalSettingsDto } from './dto/update-setting.dto';

@Injectable()
export class ProfessionalService {
  constructor(private prisma: PrismaService) {}

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

    return {
      availability,
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
}
