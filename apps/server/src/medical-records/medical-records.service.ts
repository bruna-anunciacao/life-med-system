import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma, UserRole } from '@prisma/client';
import { MedicalRecordsRepository } from './medical-records.repository';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { ListMedicalRecordsQueryDto } from './dto/list-medical-records-query.dto';
import {
  MedicalRecordResponseDto,
  MedicalRecordPatientResponseDto,
  MedicalRecordListResponseDto,
  MedicalRecordPatientListResponseDto,
} from './dto/medical-record-response.dto';
import {
  MedicalRecordPdfService,
  PatientMedicalRecordPdfInput,
} from './medical-record-pdf.service';

type MedicalRecordWithRelations = Prisma.MedicalRecordGetPayload<{
  include: {
    author: true;
    patient: true;
    appointment: true;
  };
}>;

const VALID_LINK_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.COMPLETED,
];

@Injectable()
export class MedicalRecordsService {
  constructor(
    private readonly repository: MedicalRecordsRepository,
    private readonly pdfService: MedicalRecordPdfService,
  ) {}

  async create(
    authorId: string,
    dto: CreateMedicalRecordDto,
  ): Promise<MedicalRecordResponseDto> {
    const appointment = await this.repository.findAppointmentById(
      dto.appointmentId,
    );

    if (!appointment) {
      throw new NotFoundException('Consulta não encontrada.');
    }

    if (appointment.professionalId !== authorId) {
      throw new ForbiddenException(
        'Apenas o profissional responsável pela consulta pode criar o prontuário.',
      );
    }

    try {
      const record = await this.repository.createForAppointment(
        dto,
        appointment.patientId,
        authorId,
      );
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

    const record = await this.repository.findByAppointmentId(appointmentId);

    if (!record) {
      throw new NotFoundException('Prontuário não encontrado.');
    }

    return this.authorizeAndSerialize(record, requesterId, requesterRole);
  }

  async findById(
    recordId: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<MedicalRecordResponseDto | MedicalRecordPatientResponseDto> {
    if (
      requesterRole !== UserRole.PROFESSIONAL &&
      requesterRole !== UserRole.PATIENT
    ) {
      throw new ForbiddenException('Acesso negado a este prontuário.');
    }

    const record = await this.repository.findById(recordId);

    if (!record) {
      throw new NotFoundException('Prontuário não encontrado.');
    }

    return this.authorizeAndSerialize(record, requesterId, requesterRole);
  }

  async list(
    requesterId: string,
    requesterRole: UserRole,
    query: ListMedicalRecordsQueryDto,
  ): Promise<
    MedicalRecordListResponseDto | MedicalRecordPatientListResponseDto
  > {
    if (
      requesterRole !== UserRole.PROFESSIONAL &&
      requesterRole !== UserRole.PATIENT
    ) {
      throw new ForbiddenException('Acesso negado.');
    }

    if (requesterRole === UserRole.PROFESSIONAL) {
      if (query.authorId && query.authorId !== requesterId) {
        throw new ForbiddenException(
          'Não é possível listar prontuários de outros profissionais.',
        );
      }
    }

    const { records, total, page, limit } =
      await this.repository.listForRequester(requesterId, requesterRole, query);

    if (requesterRole === UserRole.PATIENT) {
      return {
        data: records.map((r) => this.toPatientResponseDto(r)),
        page,
        limit,
        total,
      };
    }

    return {
      data: records.map((r) => this.toResponseDto(r)),
      page,
      limit,
      total,
    };
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

    const records = await this.repository.findByPatient(patientId);

    return records.map((r) => this.toResponseDto(r));
  }

  async update(
    recordId: string,
    requesterId: string,
    dto: UpdateMedicalRecordDto,
  ): Promise<MedicalRecordResponseDto> {
    const record = await this.repository.findById(recordId);

    if (!record) {
      throw new NotFoundException('Prontuário não encontrado.');
    }

    if (record.authorId !== requesterId) {
      throw new ForbiddenException(
        'Apenas o autor do prontuário pode editá-lo.',
      );
    }

    const updated = await this.repository.updateRecord(recordId, dto);

    return this.toResponseDto(updated);
  }

  async generatePatientPdf(
    appointmentId: string,
    patientId: string,
  ): Promise<PDFKit.PDFDocument> {
    const record =
      await this.repository.findPatientPdfRecordByAppointment(appointmentId);

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

  private async authorizeAndSerialize(
    record: MedicalRecordWithRelations,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<MedicalRecordResponseDto | MedicalRecordPatientResponseDto> {
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

  private async hasPriorAppointment(
    professionalId: string,
    patientId: string,
  ): Promise<boolean> {
    return this.repository.hasValidPriorAppointment(
      professionalId,
      patientId,
      VALID_LINK_STATUSES,
    );
  }

  private toResponseDto(
    record: MedicalRecordWithRelations,
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
      patient: {
        id: record.patient.id,
        name: record.patient.name,
      },
      appointment: {
        id: record.appointment.id,
        dateTime: record.appointment.dateTime,
        modality: record.appointment.modality,
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
    record: MedicalRecordWithRelations,
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
      appointment: {
        id: record.appointment.id,
        dateTime: record.appointment.dateTime,
        modality: record.appointment.modality,
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
