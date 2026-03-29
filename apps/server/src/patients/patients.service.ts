import { Injectable } from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import type PDFKit from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from '../reports/reports.service';
import { AppointmentReportItemDto } from '../reports/dto/appointment-made.dto';
import { ExportAppointmentsQueryDto } from './dto/export-appointments-query.dto';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reportsService: ReportsService,
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
}
