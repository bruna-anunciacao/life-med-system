import { Injectable } from '@nestjs/common';
import {
  AppointmentStatus,
  PatientApprovalStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { CreatePatientDto } from './dto/create-patient.dto';
import { ExportAppointmentsQueryDto } from './dto/export-appointments-query.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAppointmentsByStatus(
    patientId: string,
    status: AppointmentStatus,
    query: ExportAppointmentsQueryDto,
  ) {
    return this.prisma.appointment.findMany({
      where: {
        patientId,
        status,
        ...this.buildAppointmentReportWhere(query),
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
                specialities: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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
  }

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findUserByCpf(cpf: string) {
    return this.prisma.user.findUnique({ where: { cpf } });
  }

  createAssistedPatient(dto: CreatePatientDto, hashedPassword: string) {
    return this.prisma.user.create({
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
          },
        },
        ...(dto.address && {
          address: {
            create: {
              zipCode: dto.address.zipCode,
              street: dto.address.street,
              number: dto.address.number,
              complement: dto.address.complement,
              district: dto.address.district,
              city: dto.address.city,
              state: dto.address.state,
            },
          },
        }),
      },
      include: {
        patientProfile: true,
        address: true,
      },
    });
  }

  findPatientForUpdate(patientId: string) {
    return this.prisma.user.findUnique({
      where: { id: patientId },
      include: { patientProfile: true },
    });
  }

  updatePatient(patientId: string, dto: UpdatePatientDto) {
    return this.prisma.user.update({
      where: { id: patientId },
      data: {
        name: dto.name,
        cpf: dto.cpf,
        email: dto.email,
        patientProfile: {
          update: {
            phone: dto.phone,
            gender: dto.gender,
            dateOfBirth:
              dto.dateOfBirth === undefined
                ? undefined
                : dto.dateOfBirth === null
                  ? null
                  : new Date(dto.dateOfBirth),
          },
        },
      },
      include: {
        patientProfile: true,
        address: true,
      },
    });
  }

  updatePatientApprovalStatus(
    patientProfileId: string,
    approvalStatus: PatientApprovalStatus,
  ) {
    return this.prisma.patientProfile.update({
      where: { id: patientProfileId },
      data: { approvalStatus },
      include: {
        user: true,
        questionnaire: {
          include: {
            answers: { include: { question: true, option: true } },
          },
        },
      },
    });
  }

  listPatients(search?: string) {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.PATIENT,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { cpf: { contains: search } },
          ],
        }),
      },
      include: {
        patientProfile: {
          include: {
            questionnaire: {
              include: {
                answers: { include: { question: true, option: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findPatientWithQuestionnaire(patientId: string) {
    return this.prisma.user.findUnique({
      where: { id: patientId },
      include: {
        patientProfile: {
          include: {
            questionnaire: {
              include: {
                answers: { include: { question: true, option: true } },
              },
            },
          },
        },
      },
    });
  }

  private buildAppointmentReportWhere(
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
}
