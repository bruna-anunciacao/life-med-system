import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import {
  MedicalRecordResponseDto,
  MedicalRecordPatientResponseDto,
} from './dto/medical-record-response.dto';
import {
  MedicalRecordPdfService,
  PatientMedicalRecordPdfInput,
} from './medical-record-pdf.service';

type MedicalRecordWithAuthor = Prisma.MedicalRecordGetPayload<{
  include: { author: true };
}>;

const VALID_LINK_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.COMPLETED,
];

@Injectable()
export class MedicalRecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: MedicalRecordPdfService,
  ) {}

  async create(
    authorId: string,
    dto: CreateMedicalRecordDto,
  ): Promise<MedicalRecordResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Consulta não encontrada.');
    }

    if (appointment.professionalId !== authorId) {
      throw new ForbiddenException(
        'Apenas o profissional responsável pela consulta pode criar o prontuário.',
      );
    }

    try {
      const record = await this.prisma.medicalRecord.create({
        data: {
          appointmentId: dto.appointmentId,
          patientId: appointment.patientId,
          authorId,
          chiefComplaint: dto.chiefComplaint,
          diagnosis: dto.diagnosis,
          treatmentPlan: dto.treatmentPlan,
          prescriptions: dto.prescriptions,
          internalNotes: dto.internalNotes,
        },
        include: { author: true },
      });
      return this.toResponseDto(record);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Já existe um prontuário para esta consulta.',
        );
      }
      throw error;
    }
  }

  async findByAppointment(
    appointmentId: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<MedicalRecordResponseDto | MedicalRecordPatientResponseDto> {
    if (
      requesterRole !== UserRole.PROFESSIONAL &&
      requesterRole !== UserRole.PATIENT
    ) {
      throw new ForbiddenException('Acesso negado a este prontuário.');
    }

    const record = await this.prisma.medicalRecord.findUnique({
      where: { appointmentId },
      include: { author: true },
    });

    if (!record) {
      throw new NotFoundException('Prontuário não encontrado.');
    }

    if (requesterRole === UserRole.PATIENT) {
      if (record.patientId !== requesterId) {
        throw new ForbiddenException('Acesso negado a este prontuário.');
      }
      return this.toPatientResponseDto(record);
    }

    const isAuthor = record.authorId === requesterId;
    const hasLink =
      isAuthor ||
      (await this.hasPriorAppointment(requesterId, record.patientId));

    if (!hasLink) {
      throw new ForbiddenException('Acesso negado a este prontuário.');
    }

    return this.toResponseDto(record);
  }

  async findByPatient(
    patientId: string,
    requesterId: string,
  ): Promise<MedicalRecordResponseDto[]> {
    const hasLink = await this.hasPriorAppointment(requesterId, patientId);

    if (!hasLink) {
      throw new ForbiddenException(
        'Acesso negado: sem vínculo de consulta com este paciente.',
      );
    }

    const records = await this.prisma.medicalRecord.findMany({
      where: { patientId },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => this.toResponseDto(r));
  }

  async update(
    recordId: string,
    requesterId: string,
    dto: UpdateMedicalRecordDto,
  ): Promise<MedicalRecordResponseDto> {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id: recordId },
      include: { author: true },
    });

    if (!record) {
      throw new NotFoundException('Prontuário não encontrado.');
    }

    if (record.authorId !== requesterId) {
      throw new ForbiddenException(
        'Apenas o autor do prontuário pode editá-lo.',
      );
    }

    const updated = await this.prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        chiefComplaint: dto.chiefComplaint,
        diagnosis: dto.diagnosis,
        treatmentPlan: dto.treatmentPlan,
        prescriptions: dto.prescriptions,
        internalNotes: dto.internalNotes,
      },
      include: { author: true },
    });

    return this.toResponseDto(updated);
  }

  async generatePatientPdf(
    appointmentId: string,
    patientId: string,
  ): Promise<PDFKit.PDFDocument> {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            professional: {
              include: {
                professionalProfile: {
                  include: { specialities: true },
                },
              },
            },
            patient: { include: { patientProfile: true } },
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Prontuário não encontrado.');
    }

    if (record.patientId !== patientId) {
      throw new ForbiddenException('Acesso negado a este prontuário.');
    }

    const input: PatientMedicalRecordPdfInput = {
      patient: {
        name: record.appointment.patient.name,
        cpf: record.appointment.patient.cpf,
        dateOfBirth:
          record.appointment.patient.patientProfile?.dateOfBirth ?? null,
      },
      appointment: {
        dateTime: record.appointment.dateTime,
        modality: record.appointment.modality,
      },
      professional: {
        name: record.appointment.professional.name,
        specialties:
          record.appointment.professional.professionalProfile?.specialities.map(
            (s) => s.name,
          ) ?? [],
      },
      record: {
        chiefComplaint: record.chiefComplaint,
        diagnosis: record.diagnosis,
        treatmentPlan: record.treatmentPlan,
        prescriptions: record.prescriptions,
        createdAt: record.createdAt,
      },
    };

    return this.pdfService.generate(input);
  }

  private async hasPriorAppointment(
    professionalId: string,
    patientId: string,
  ): Promise<boolean> {
    const count = await this.prisma.appointment.count({
      where: {
        professionalId,
        patientId,
        status: { in: VALID_LINK_STATUSES },
      },
    });
    return count > 0;
  }

  private toResponseDto(
    record: MedicalRecordWithAuthor,
  ): MedicalRecordResponseDto {
    return {
      id: record.id,
      appointmentId: record.appointmentId,
      patientId: record.patientId,
      author: {
        id: record.author.id,
        name: record.author.name,
        email: record.author.email,
      },
      chiefComplaint: record.chiefComplaint,
      diagnosis: record.diagnosis,
      treatmentPlan: record.treatmentPlan,
      prescriptions: record.prescriptions,
      internalNotes: record.internalNotes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toPatientResponseDto(
    record: MedicalRecordWithAuthor,
  ): MedicalRecordPatientResponseDto {
    return {
      id: record.id,
      appointmentId: record.appointmentId,
      patientId: record.patientId,
      author: {
        id: record.author.id,
        name: record.author.name,
        email: record.author.email,
      },
      chiefComplaint: record.chiefComplaint,
      diagnosis: record.diagnosis,
      treatmentPlan: record.treatmentPlan,
      prescriptions: record.prescriptions,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
