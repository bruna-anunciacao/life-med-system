import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from '../patients/dto/create-patient.dto';
import { UpdatePatientDto } from '../patients/dto/update-patient.dto';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { PatientsService } from '../patients/patients.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ManagerService {
  constructor(
    private prisma: PrismaService,
    private patientService: PatientsService,
  ) {}

  async createPatient(dto: CreatePatientDto) {
    return this.patientService.createPatient(dto);
  }

  async updatePatient(patientId: string, dto: UpdatePatientDto) {
    return this.patientService.updatePatient(patientId, dto);
  }

  async listPatients() {
    return this.patientService.listPatients();
  }

  async getPatient(patientId: string) {
    return this.patientService.getPatient(patientId);
  }

  async createAppointment(dto: CreateAppointmentDto) {
    const patient = await this.prisma.user.findUnique({
      where: { id: dto.patientId },
    });

    if (!patient || patient.role !== UserRole.PATIENT) {
      throw new NotFoundException('Paciente não encontrado');
    }

    const professional = await this.prisma.user.findUnique({
      where: { id: dto.professionalId },
    });

    if (!professional || professional.role !== UserRole.PROFESSIONAL) {
      throw new NotFoundException('Profissional não encontrado');
    }

    const appointmentDate = new Date(dto.dateTime);
    const dayOfWeek = appointmentDate.getDay();

    const availability = await this.prisma.availability.findFirst({
      where: {
        professionalId: dto.professionalId,
        dayOfWeek,
        validFrom: { lte: appointmentDate },
        validUntil: { gte: appointmentDate },
      },
    });

    if (!availability) {
      throw new BadRequestException(
        'Profissional não tem disponibilidade neste horário',
      );
    }
    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        professionalId: dto.professionalId,
        dateTime: appointmentDate,
        status: 'PENDING',
        notes: dto.notes,
      },
      include: {
        patient: { include: { patientProfile: true } },
        professional: { include: { professionalProfile: true } },
      },
    });

    return appointment;
  }

  async getAppointmentsByManager() {
    return this.prisma.appointment.findMany({
      include: {
        patient: { include: { patientProfile: true } },
        professional: { include: { professionalProfile: true } },
      },
      orderBy: { dateTime: 'desc' },
    });
  }

  async getProfessionalAvailability(professionalId: string) {
    const professional = await this.prisma.user.findUnique({
      where: { id: professionalId },
      include: { professionalProfile: true },
    });

    if (!professional || professional.role !== UserRole.PROFESSIONAL) {
      throw new NotFoundException('Profissional não encontrado');
    }

    const availability = await this.prisma.availability.findMany({
      where: {
        professionalId,
        validUntil: null,
      },
      orderBy: { dayOfWeek: 'asc' },
    });

    return {
      professional: {
        id: professional.id,
        name: professional.name,
        email: professional.email,
        specialty: professional.professionalProfile?.specialty,
      },
      availability: availability.map((a) => ({
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
    };
  }
}
