import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma, UserRole, UserStatus } from '@prisma/client';
import type PDFKit from 'pdfkit';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from '../reports/reports.service';
import { MailService } from '../mail/mail.service';
import { AppointmentReportItemDto } from '../reports/dto/appointment-made.dto';
import { ExportAppointmentsQueryDto } from './dto/export-appointments-query.dto';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { UserRoleEnum } from '../auth/enums/user-role-enum';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reportsService: ReportsService,
    private readonly mailService: MailService,
  ) {}

  async exportDoneAppointmentsReport(
    patientId: string,
    query: ExportAppointmentsQueryDto,
  ): Promise<PDFKit.PDFDocument> {
    const appointments = await this.findPatientAppointmentsByStatus(
      patientId,
      AppointmentStatus.COMPLETED,
      query,
    );

    return this.reportsService.generateDoneAppointmentsPdf(appointments);
  }

  async exportPendingAppointmentsReport(
    patientId: string,
    query: ExportAppointmentsQueryDto,
  ): Promise<PDFKit.PDFDocument> {
    const appointments = await this.findPatientAppointmentsByStatus(
      patientId,
      AppointmentStatus.PENDING,
      query,
    );

    return this.reportsService.generatePendingAppointmentsPdf(appointments);
  }

  async exportCancelledAppointmentsReport(
    patientId: string,
    query: ExportAppointmentsQueryDto,
  ): Promise<PDFKit.PDFDocument> {
    const appointments = await this.findPatientAppointmentsByStatus(
      patientId,
      AppointmentStatus.CANCELLED,
      query,
    );

    return this.reportsService.generateCancelledAppointmentsPdf(appointments);
  }

  private async findPatientAppointmentsByStatus(
    patientId: string,
    status: AppointmentStatus,
    query: ExportAppointmentsQueryDto,
  ): Promise<AppointmentReportItemDto[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        patientId,
        status,
        ...this.buildWhere(query),
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            professionalProfile: {
              select: {
                specialty: true,
                modality: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    return appointments.map((appointment) => ({
      id: appointment.id,
      dateTime: appointment.dateTime,
      status: appointment.status,
      createdAt: appointment.createdAt,
      patientId: appointment.patient.id,
      patientName: appointment.patient.name,
      professionalId: appointment.professional.id,
      professionalName: appointment.professional.name,
      specialty: appointment.professional.professionalProfile?.specialty || '-',
      modality: appointment.professional.professionalProfile?.modality || '-',
      price: appointment.professional.professionalProfile?.price || 0,
    }));
  }

  private buildWhere(
    query: ExportAppointmentsQueryDto,
  ): Omit<Prisma.AppointmentWhereInput, 'patientId' | 'status'> {
    const where: Omit<Prisma.AppointmentWhereInput, 'patientId' | 'status'> =
      {};

    if (query.professionalId) {
      where.professionalId = query.professionalId;
    }

    if (query.startDate || query.endDate) {
      where.dateTime = {};

      if (query.startDate) {
        where.dateTime.gte = new Date(query.startDate);
      }

      if (query.endDate) {
        where.dateTime.lte = new Date(query.endDate);
      }
    }

    return where;
  }

  async createPatient(dto: CreatePatientDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email já cadastrado');
    }

    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: UserRole.PATIENT,
        status: UserStatus.COMPLETED,
        emailVerified: true,
        cpf: dto.cpf,
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

    this.mailService
      .sendTempPasswordEmail({ name: user.name, email: user.email }, tempPassword)
      .catch((err) => this.logger.error('Falha ao enviar senha temporária:', err));

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

    if (!patient || patient.role !== UserRole.PATIENT) {
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

  async getPatient(patientId: string) {
    const patient = await this.prisma.user.findUnique({
      where: { id: patientId },
      include: { patientProfile: true },
    });

    if (!patient || patient.role !== UserRole.PATIENT) {
      throw new NotFoundException('Paciente não encontrado');
    }

    return {
      id: patient.id,
      email: patient.email,
      name: patient.name,
      cpf: patient.cpf,
      role: patient.role,
      status: patient.status,
      emailVerified: patient.emailVerified,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      phone: patient.patientProfile?.phone,
      dateOfBirth: patient.patientProfile?.dateOfBirth,
      gender: patient.patientProfile?.gender,
      address: patient.patientProfile?.address,
      patientProfile: patient.patientProfile,
    };
  }
}
