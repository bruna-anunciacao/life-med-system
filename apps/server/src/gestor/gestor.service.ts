import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dtos/create-patient.dto';
import { UpdatePatientDto } from './dtos/update-patient.dto';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UserRoleEnum } from '../auth/enums/user-role-enum';
import { UserStatusEnum } from '../auth/enums/user-status-enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class GestorService {
  constructor(private prisma: PrismaService) {}

  async createPatient(dto: CreatePatientDto) {
    // Verificar se email já existe
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email já cadastrado');
    }

    // Gerar senha temporária
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Criar usuário PATIENT
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.email.split('@')[0],
        role: UserRoleEnum.PATIENT,
        status: UserStatusEnum.COMPLETED,
        emailVerified: true,
        cpf: dto.cpf || '00000000000',
        patientProfile: {
          create: {
            phone: dto.phone,
            dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
            gender: dto.gender,
            address: dto.address,
          },
        },
      },
      include: {
        patientProfile: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      patientProfile: user.patientProfile,
    };
  }

  async updatePatient(patientId: string, dto: UpdatePatientDto) {
    const patient = await this.prisma.user.findUnique({
      where: { id: patientId },
      include: { patientProfile: true },
    });

    if (!patient || patient.role !== UserRoleEnum.PATIENT) {
      throw new NotFoundException('Paciente não encontrado');
    }

    if (!patient.patientProfile) {
      throw new NotFoundException('Perfil do paciente não encontrado');
    }


    const updated = await this.prisma.patientProfile.update({
      where: { userId: patientId },
      data: {
        phone: dto.phone ?? patient.patientProfile.phone,
        dateOfBirth: dto.dateOfBirth
          ? new Date(dto.dateOfBirth)
          : patient.patientProfile.dateOfBirth,
        gender: dto.gender ?? patient.patientProfile.gender,
        address: dto.address ?? patient.patientProfile.address,
      },
      include: {
        user: true,
      },
    });

    return {
      id: updated.userId,
      email: updated.user.email,
      name: updated.user.name,
      patientProfile: updated,
    };
  }

  async listPatients() {
    return this.prisma.user.findMany({
      where: { role: UserRoleEnum.PATIENT },
      include: { patientProfile: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAppointment(dto: CreateAppointmentDto) {

    const patient = await this.prisma.user.findUnique({
      where: { id: dto.patientId },
    });

    if (!patient || patient.role !== UserRoleEnum.PATIENT) {
      throw new NotFoundException('Paciente não encontrado');
    }

    const professional = await this.prisma.user.findUnique({
      where: { id: dto.professionalId },
    });

    if (!professional || professional.role !== UserRoleEnum.PROFESSIONAL) {
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

  async listAppointments() {

    return this.prisma.appointment.findMany({
      include: {
        patient: { include: { patientProfile: true } },
        professional: { include: { professionalProfile: true } },
      },
      orderBy: { dateTime: 'desc' },
    });
  }

  async getAppointmentsByGestor() {
    return this.prisma.appointment.findMany({
      include: {
        patient: { include: { patientProfile: true } },
        professional: { include: { professionalProfile: true } },
      },
      orderBy: { dateTime: 'desc' },
    });
  }
}
