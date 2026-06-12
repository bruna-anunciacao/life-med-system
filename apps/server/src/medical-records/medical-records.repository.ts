import { Injectable } from '@nestjs/common';
import { AppointmentStatus, Prisma, UserRole } from '@prisma/client';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { ListMedicalRecordsQueryDto } from './dto/list-medical-records-query.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { PrismaService } from '../prisma/prisma.service';

const RECORD_INCLUDE = {
  author: true,
  patient: true,
  appointment: true,
} as const;

@Injectable()
export class MedicalRecordsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAppointmentById(id: string) {
    return this.prisma.appointment.findUnique({ where: { id } });
  }

  createForAppointment(
    dto: CreateMedicalRecordDto,
    patientId: string,
    authorId: string,
  ) {
    return this.prisma.medicalRecord.create({
      data: {
        appointmentId: dto.appointmentId,
        patientId,
        authorId,
        chiefComplaint: dto.chiefComplaint,
        diagnosis: dto.diagnosis,
        treatmentPlan: dto.treatmentPlan,
        prescriptions: dto.prescriptions,
        internalNotes: dto.internalNotes,
      },
      include: RECORD_INCLUDE,
    });
  }

  findByAppointmentId(appointmentId: string) {
    return this.prisma.medicalRecord.findUnique({
      where: { appointmentId },
      include: RECORD_INCLUDE,
    });
  }

  findById(id: string) {
    return this.prisma.medicalRecord.findUnique({
      where: { id },
      include: RECORD_INCLUDE,
    });
  }

  async listForRequester(
    requesterId: string,
    requesterRole: UserRole,
    query: ListMedicalRecordsQueryDto,
  ) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const where = this.buildListWhere(requesterId, requesterRole, query);

    const [records, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where,
        include: RECORD_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.medicalRecord.count({ where }),
    ]);

    return { records, total, page, limit };
  }

  findByPatient(patientId: string) {
    return this.prisma.medicalRecord.findMany({
      where: { patientId },
      include: RECORD_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  updateRecord(id: string, dto: UpdateMedicalRecordDto) {
    return this.prisma.medicalRecord.update({
      where: { id },
      data: {
        chiefComplaint: dto.chiefComplaint,
        diagnosis: dto.diagnosis,
        treatmentPlan: dto.treatmentPlan,
        prescriptions: dto.prescriptions,
        internalNotes: dto.internalNotes,
      },
      include: RECORD_INCLUDE,
    });
  }

  findPatientPdfRecordByAppointment(appointmentId: string) {
    return this.prisma.medicalRecord.findUnique({
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
  }

  async hasValidPriorAppointment(
    professionalId: string,
    patientId: string,
    statuses: AppointmentStatus[],
  ) {
    const count = await this.prisma.appointment.count({
      where: {
        professionalId,
        patientId,
        status: { in: statuses },
      },
    });
    return count > 0;
  }

  private buildListWhere(
    requesterId: string,
    requesterRole: UserRole,
    query: ListMedicalRecordsQueryDto,
  ): Prisma.MedicalRecordWhereInput {
    const where: Prisma.MedicalRecordWhereInput = {};

    if (requesterRole === UserRole.PROFESSIONAL) {
      where.authorId = requesterId;
      if (query.patientId) where.patientId = query.patientId;
    } else {
      where.patientId = requesterId;
      if (query.authorId) where.authorId = query.authorId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {
        ...(query.startDate && { gte: new Date(query.startDate) }),
        ...(query.endDate && { lte: new Date(query.endDate) }),
      };
    }

    if (query.search) {
      const term = query.search.trim();
      if (term.length > 0) {
        where.OR = [
          { patient: { name: { contains: term, mode: 'insensitive' } } },
          { chiefComplaint: { contains: term, mode: 'insensitive' } },
          { diagnosis: { contains: term, mode: 'insensitive' } },
        ];
      }
    }

    return where;
  }
}
