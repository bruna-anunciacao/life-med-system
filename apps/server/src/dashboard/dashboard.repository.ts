import { Injectable } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  countAppointmentsByStatus(start: Date, end: Date) {
    return this.prisma.appointment.groupBy({
      by: ['status'],
      where: { dateTime: { gte: start, lte: end } },
      _count: true,
    });
  }

  countAppointmentsByModality(start: Date, end: Date) {
    return this.prisma.appointment.groupBy({
      by: ['modality'],
      where: { dateTime: { gte: start, lte: end } },
      _count: true,
    });
  }

  findAppointmentSpecialitiesInRange(start: Date, end: Date) {
    return this.prisma.appointment.findMany({
      where: { dateTime: { gte: start, lte: end } },
      select: {
        professional: {
          select: {
            professionalProfile: {
              select: { specialities: { select: { name: true } } },
            },
          },
        },
      },
    });
  }

  dailyAppointmentCounts(start: Date, end: Date) {
    return this.prisma.$queryRaw<{ bucket: Date; count: bigint }[]>`
      SELECT date_trunc('day', date_time) AS bucket, COUNT(*)::bigint AS count
      FROM appointments
      WHERE date_time >= ${start} AND date_time <= ${end}
      GROUP BY bucket
      ORDER BY bucket ASC
    `;
  }

  monthlyAppointmentCounts(start: Date, end: Date) {
    return this.prisma.$queryRaw<{ bucket: Date; count: bigint }[]>`
      SELECT date_trunc('month', date_time) AS bucket, COUNT(*)::bigint AS count
      FROM appointments
      WHERE date_time >= ${start} AND date_time <= ${end}
      GROUP BY bucket
      ORDER BY bucket ASC
    `;
  }

  countMedicalRecordsInRange(start: Date, end: Date) {
    return this.prisma.medicalRecord.count({
      where: { createdAt: { gte: start, lte: end } },
    });
  }

  countPendingAppointments(now: Date) {
    return Promise.all([
      this.prisma.appointment.count({
        where: { status: AppointmentStatus.PENDING, dateTime: { gte: now } },
      }),
      this.prisma.appointment.count({
        where: { status: AppointmentStatus.PENDING, dateTime: { lt: now } },
      }),
    ]);
  }

  countQuestionnairesByAnsweredBy(start: Date, end: Date) {
    return this.prisma.vulnerabilityQuestionnaire.groupBy({
      by: ['answeredBy'],
      where: { responseDate: { gte: start, lte: end } },
      _count: true,
    });
  }

  countQuestionnairesByVulnerability(start: Date, end: Date) {
    return this.prisma.vulnerabilityQuestionnaire.groupBy({
      by: ['isVulnerable'],
      where: { responseDate: { gte: start, lte: end } },
      _count: true,
    });
  }

  groupPatientsByGender() {
    return this.prisma.patientProfile.groupBy({
      by: ['gender'],
      _count: true,
    });
  }

  findPatientBirthDates() {
    return this.prisma.patientProfile.findMany({
      select: { dateOfBirth: true },
    });
  }

  groupUsersByRole() {
    return this.prisma.user.groupBy({ by: ['role'], _count: true });
  }

  groupUsersByStatus() {
    return this.prisma.user.groupBy({ by: ['status'], _count: true });
  }
}
