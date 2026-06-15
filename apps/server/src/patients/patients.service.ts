import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AppointmentStatus,
  PatientApprovalStatus,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PatientsRepository } from './patients.repository';
import { ReportsService } from '../reports/reports.service';
import { MailService } from '../mail/mail.service';
import { AppointmentReportItemDto } from '../reports/dto/appointment-made.dto';
import { ExportAppointmentsQueryDto } from './dto/export-appointments-query.dto';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import PDFKit from 'pdfkit';

type PDFDocumentType = PDFKit.PDFDocument;

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    private readonly repository: PatientsRepository,
    private readonly reportsService: ReportsService,
    private readonly mailService: MailService,
  ) {}

  async exportDoneAppointmentsReport(
    patientId: string,
    query: ExportAppointmentsQueryDto,
  ): Promise<PDFDocumentType | null> {
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
  ): Promise<PDFDocumentType | null> {
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
  ): Promise<PDFDocumentType | null> {
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
    const appointments = await this.repository.findAppointmentsByStatus(
      patientId,
      status,
      query,
    );

    return appointments.map((appointment) => ({
      id: appointment.id,
      dateTime: appointment.dateTime,
      status: appointment.status,
      createdAt: appointment.createdAt,
      patientId: appointment.patient.id,
      patientName: appointment.patient.name,
      professionalId: appointment.professional.id,
      professionalName: appointment.professional.name,
      specialty:
        appointment.professional.professionalProfile?.specialities
          ?.map((spec) => spec.name)
          .join(', ') || '-',
      modality: appointment.professional.professionalProfile?.modality || '-',
      price: appointment.professional.professionalProfile?.price || 0,
    }));
  }

  async createAssistedPatient(dto: CreatePatientDto) {
    const existing = await this.repository.findUserByEmail(dto.email);

    if (existing) {
      throw new BadRequestException('Email já cadastrado');
    }

    if (dto.cpf) {
      const cpfExists = await this.repository.findUserByCpf(dto.cpf);
      if (cpfExists) {
        throw new BadRequestException('CPF já cadastrado');
      }
    }

    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await this.repository.createAssistedPatient(
      dto,
      hashedPassword,
    );

    this.mailService
      .sendTempPasswordEmail(
        { name: user.name, email: user.email },
        tempPassword,
      )
      .catch((err) =>
        this.logger.error('Falha ao enviar senha temporária:', err),
      );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      patientProfile: user.patientProfile,
      address: user.address,
    };
  }

  async updatePatient(patientId: string, dto: UpdatePatientDto) {
    const patient = await this.repository.findPatientForUpdate(patientId);

    if (!patient || patient.role !== UserRole.PATIENT) {
      throw new NotFoundException('Paciente não encontrado');
    }

    if (!patient.patientProfile) {
      throw new NotFoundException('Perfil do paciente não encontrado');
    }

    if (dto.cpf !== undefined && dto.cpf && dto.cpf !== patient.cpf) {
      const cpfExists = await this.repository.findUserByCpf(dto.cpf);
      if (cpfExists && cpfExists.id !== patientId) {
        throw new BadRequestException('CPF já cadastrado');
      }
    }

    const updatedUser = await this.repository.updatePatient(patientId, dto);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      cpf: updatedUser.cpf,
      phone: updatedUser.patientProfile?.phone,
      dateOfBirth: updatedUser.patientProfile?.dateOfBirth,
      gender: updatedUser.patientProfile?.gender,
      address: updatedUser.address,
      patientProfile: updatedUser.patientProfile,
    };
  }

  async updatePatientApprovalStatus(
    patientId: string,
    approvalStatus: PatientApprovalStatus,
  ) {
    const patient = await this.repository.findPatientForUpdate(patientId);

    if (!patient || patient.role !== UserRole.PATIENT) {
      throw new NotFoundException('Paciente não encontrado');
    }

    if (!patient.patientProfile) {
      throw new NotFoundException('Perfil do paciente não encontrado');
    }

    const updatedProfile = await this.repository.updatePatientApprovalStatus(
      patient.patientProfile.id,
      approvalStatus,
    );

    return {
      id: updatedProfile.user.id,
      email: updatedProfile.user.email,
      name: updatedProfile.user.name,
      cpf: updatedProfile.user.cpf,
      role: updatedProfile.user.role,
      status: updatedProfile.user.status,
      emailVerified: updatedProfile.user.emailVerified,
      createdAt: updatedProfile.user.createdAt,
      updatedAt: updatedProfile.user.updatedAt,
      phone: updatedProfile.phone,
      dateOfBirth: updatedProfile.dateOfBirth,
      gender: updatedProfile.gender,
      patientProfile: updatedProfile,
      questionnaire: updatedProfile.questionnaire ?? null,
    };
  }

  async listPatients(search?: string) {
    return this.repository.listPatients(search);
  }

  async getPatient(patientId: string) {
    const patient =
      await this.repository.findPatientWithQuestionnaire(patientId);

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
      patientProfile: patient.patientProfile,
      questionnaire: patient.patientProfile?.questionnaire ?? null,
    };
  }
}
