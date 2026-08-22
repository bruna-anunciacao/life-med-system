import { Injectable } from '@nestjs/common';
import {
  AppointmentModality,
  AppointmentStatus,
  QuestionnaireAnsweredBy,
} from '@prisma/client';
import { DashboardRepository } from './dashboard.repository';
import { DashboardOverviewQueryDto } from './dto/dashboard-overview-query.dto';
import { DashboardOverview } from './dashboard.types';

const DEFAULT_RANGE_DAYS = 30;
const UNSPECIFIED_SPECIALITY = 'Não especificada';
const UNSPECIFIED_GENDER = 'Não informado';

const AGE_BRACKETS: { label: string; min: number; max: number }[] = [
  { label: '0-17', min: 0, max: 17 },
  { label: '18-29', min: 18, max: 29 },
  { label: '30-44', min: 30, max: 44 },
  { label: '45-59', min: 45, max: 59 },
  { label: '60+', min: 60, max: Infinity },
];
const UNSPECIFIED_AGE = 'Não informado';

// Datas "YYYY-MM-DD" recebidas na query são interpretadas pelo JS `Date` como
// meia-noite UTC. Delimitamos o período em UTC (em vez de horário local) para
// que o range não seja deslocado em fusos com offset negativo (ex.: UTC-3).
function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setUTCHours(23, 59, 59, 999);
  return result;
}

function resolveAge(dateOfBirth: Date, now: Date): number {
  let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dateOfBirth.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getUTCDate() < dateOfBirth.getUTCDate())
  ) {
    age -= 1;
  }
  return age;
}

function toEmptyRecord<T extends string>(keys: T[]): Record<T, number> {
  return keys.reduce(
    (acc, key) => {
      acc[key] = 0;
      return acc;
    },
    {} as Record<T, number>,
  );
}

@Injectable()
export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  async getOverview(query: DashboardOverviewQueryDto): Promise<DashboardOverview> {
    const now = new Date();
    const end = query.endDate ? endOfDay(new Date(query.endDate)) : endOfDay(now);
    const start = query.startDate
      ? startOfDay(new Date(query.startDate))
      : startOfDay(
          new Date(end.getTime() - DEFAULT_RANGE_DAYS * 24 * 60 * 60 * 1000),
        );

    const [
      byStatusRaw,
      byModalityRaw,
      specialityRows,
      dailyRaw,
      monthlyRaw,
      medicalRecordsCreated,
      [pendingFuture, pendingOverdue],
      byAnsweredByRaw,
      byVulnerabilityRaw,
      genderRows,
      birthDateRows,
      roleRows,
      statusRows,
    ] = await Promise.all([
      this.repository.countAppointmentsByStatus(start, end),
      this.repository.countAppointmentsByModality(start, end),
      this.repository.findAppointmentSpecialitiesInRange(start, end),
      this.repository.dailyAppointmentCounts(start, end),
      this.repository.monthlyAppointmentCounts(start, end),
      this.repository.countMedicalRecordsInRange(start, end),
      this.repository.countPendingAppointments(now),
      this.repository.countQuestionnairesByAnsweredBy(start, end),
      this.repository.countQuestionnairesByVulnerability(start, end),
      this.repository.groupPatientsByGender(),
      this.repository.findPatientBirthDates(),
      this.repository.groupUsersByRole(),
      this.repository.groupUsersByStatus(),
    ]);

    const byStatus = toEmptyRecord(Object.values(AppointmentStatus));
    for (const row of byStatusRaw) {
      byStatus[row.status] = row._count;
    }

    const byModality = toEmptyRecord(Object.values(AppointmentModality));
    for (const row of byModalityRaw) {
      byModality[row.modality] = row._count;
    }

    const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);

    const specialityCounts = new Map<string, number>();
    for (const row of specialityRows) {
      const specialities = row.professional.professionalProfile?.specialities ?? [];
      if (specialities.length === 0) {
        specialityCounts.set(
          UNSPECIFIED_SPECIALITY,
          (specialityCounts.get(UNSPECIFIED_SPECIALITY) ?? 0) + 1,
        );
        continue;
      }
      for (const speciality of specialities) {
        specialityCounts.set(
          speciality.name,
          (specialityCounts.get(speciality.name) ?? 0) + 1,
        );
      }
    }
    const bySpeciality = Array.from(specialityCounts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    const dailySeries = dailyRaw.map((row) => ({
      date: row.bucket.toISOString().slice(0, 10),
      count: Number(row.count),
    }));

    const monthlySeries = monthlyRaw.map((row) => ({
      month: row.bucket.toISOString().slice(0, 7),
      count: Number(row.count),
    }));

    const byAnsweredBy = toEmptyRecord(Object.values(QuestionnaireAnsweredBy));
    for (const row of byAnsweredByRaw) {
      byAnsweredBy[row.answeredBy] = row._count;
    }

    const totalAnswered = byVulnerabilityRaw.reduce((sum, row) => sum + row._count, 0);
    const vulnerableCount =
      byVulnerabilityRaw.find((row) => row.isVulnerable === true)?._count ?? 0;
    const vulnerablePercentage =
      totalAnswered === 0 ? 0 : Math.round((vulnerableCount / totalAnswered) * 1000) / 10;

    const byGender = genderRows
      .map((row) => ({
        label: row.gender?.trim() || UNSPECIFIED_GENDER,
        count: row._count,
      }))
      .sort((a, b) => b.count - a.count);

    const ageBucketCounts = new Map<string, number>(
      AGE_BRACKETS.map((bracket) => [bracket.label, 0]),
    );
    ageBucketCounts.set(UNSPECIFIED_AGE, 0);
    for (const row of birthDateRows) {
      if (!row.dateOfBirth) {
        ageBucketCounts.set(UNSPECIFIED_AGE, (ageBucketCounts.get(UNSPECIFIED_AGE) ?? 0) + 1);
        continue;
      }
      const age = resolveAge(row.dateOfBirth, now);
      const bracket = AGE_BRACKETS.find((b) => age >= b.min && age <= b.max);
      const label = bracket?.label ?? UNSPECIFIED_AGE;
      ageBucketCounts.set(label, (ageBucketCounts.get(label) ?? 0) + 1);
    }
    const byAgeBracket = Array.from(ageBucketCounts.entries()).map(([label, count]) => ({
      label,
      count,
    }));

    const byRole = roleRows
      .map((row) => ({ label: row.role, count: row._count }))
      .sort((a, b) => b.count - a.count);

    const byUserStatus = statusRows
      .map((row) => ({ label: row.status, count: row._count }))
      .sort((a, b) => b.count - a.count);

    return {
      period: {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
      },
      appointments: {
        total,
        byStatus,
        byModality,
        bySpeciality,
        dailySeries,
        monthlySeries,
      },
      care: {
        completedAppointments: byStatus[AppointmentStatus.COMPLETED] ?? 0,
        medicalRecordsCreated: medicalRecordsCreated,
      },
      pendingRequests: {
        total: pendingFuture + pendingOverdue,
        future: pendingFuture,
        overdue: pendingOverdue,
      },
      questionnaires: {
        totalAnswered,
        vulnerableCount,
        vulnerablePercentage,
        byAnsweredBy,
      },
      demographics: {
        byGender,
        byAgeBracket,
        byRole,
        byStatus: byUserStatus,
      },
    };
  }
}
