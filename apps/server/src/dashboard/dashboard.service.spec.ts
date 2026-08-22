import { DashboardRepository } from './dashboard.repository';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  const repository = {
    countAppointmentsByStatus: jest.fn(),
    countAppointmentsByModality: jest.fn(),
    findAppointmentSpecialitiesInRange: jest.fn(),
    dailyAppointmentCounts: jest.fn(),
    monthlyAppointmentCounts: jest.fn(),
    countMedicalRecordsInRange: jest.fn(),
    countPendingAppointments: jest.fn(),
    countQuestionnairesByAnsweredBy: jest.fn(),
    countQuestionnairesByVulnerability: jest.fn(),
    groupPatientsByGender: jest.fn(),
    findPatientBirthDates: jest.fn(),
    groupUsersByRole: jest.fn(),
    groupUsersByStatus: jest.fn(),
  };

  let service: DashboardService;

  const ageInYears = (years: number): Date => {
    const now = new Date();
    return new Date(now.getFullYear() - years, now.getMonth(), now.getDate());
  };

  const setDefaults = () => {
    repository.countAppointmentsByStatus.mockResolvedValue([
      { status: 'PENDING', _count: 3 },
      { status: 'COMPLETED', _count: 5 },
    ]);
    repository.countAppointmentsByModality.mockResolvedValue([
      { modality: 'VIRTUAL', _count: 6 },
      { modality: 'CLINIC', _count: 2 },
    ]);
    repository.findAppointmentSpecialitiesInRange.mockResolvedValue([
      {
        professional: {
          professionalProfile: { specialities: [{ name: 'Cardiologia' }] },
        },
      },
      {
        professional: {
          professionalProfile: {
            specialities: [{ name: 'Cardiologia' }, { name: 'Clínica Geral' }],
          },
        },
      },
      { professional: { professionalProfile: { specialities: [] } } },
      { professional: { professionalProfile: null } },
    ]);
    repository.dailyAppointmentCounts.mockResolvedValue([
      { bucket: new Date('2026-07-01T00:00:00.000Z'), count: 2n },
      { bucket: new Date('2026-07-02T00:00:00.000Z'), count: 4n },
    ]);
    repository.monthlyAppointmentCounts.mockResolvedValue([
      { bucket: new Date('2026-07-01T00:00:00.000Z'), count: 8n },
    ]);
    repository.countMedicalRecordsInRange.mockResolvedValue(5);
    repository.countPendingAppointments.mockResolvedValue([2, 1]);
    repository.countQuestionnairesByAnsweredBy.mockResolvedValue([
      { answeredBy: 'PATIENT', _count: 3 },
      { answeredBy: 'MANAGER', _count: 1 },
    ]);
    repository.countQuestionnairesByVulnerability.mockResolvedValue([
      { isVulnerable: true, _count: 1 },
      { isVulnerable: false, _count: 3 },
    ]);
    repository.groupPatientsByGender.mockResolvedValue([
      { gender: 'FEMININO', _count: 3 },
      { gender: null, _count: 1 },
    ]);
    repository.findPatientBirthDates.mockResolvedValue([
      { dateOfBirth: ageInYears(25) },
      { dateOfBirth: ageInYears(70) },
      { dateOfBirth: null },
    ]);
    repository.groupUsersByRole.mockResolvedValue([
      { role: 'PATIENT', _count: 10 },
      { role: 'PROFESSIONAL', _count: 2 },
    ]);
    repository.groupUsersByStatus.mockResolvedValue([
      { status: 'VERIFIED', _count: 9 },
      { status: 'PENDING', _count: 3 },
    ]);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setDefaults();
    service = new DashboardService(repository as unknown as DashboardRepository);
  });

  it('fills missing status/modality buckets with zero and totals from the counted ones', async () => {
    const result = await service.getOverview({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
    });

    expect(result.appointments.byStatus).toMatchObject({
      PENDING: 3,
      CONFIRMED: 0,
      COMPLETED: 5,
      CANCELLED: 0,
      NO_SHOW: 0,
    });
    expect(result.appointments.byModality).toMatchObject({
      VIRTUAL: 6,
      HOME_VISIT: 0,
      CLINIC: 2,
    });
    expect(result.appointments.total).toBe(8);
    expect(result.care.completedAppointments).toBe(5);
  });

  it('passes the given period to the repository as start/end of day (UTC)', async () => {
    await service.getOverview({ startDate: '2026-07-01', endDate: '2026-07-31' });

    const [start, end] = repository.countAppointmentsByStatus.mock.calls[0];
    expect(start.toISOString()).toBe('2026-07-01T00:00:00.000Z');
    expect(end.toISOString()).toBe('2026-07-31T23:59:59.999Z');
  });

  it('counts each speciality of a multi-speciality professional and buckets missing ones as unspecified', async () => {
    const result = await service.getOverview({});

    const bySpeciality = Object.fromEntries(
      result.appointments.bySpeciality.map((b) => [b.label, b.count]),
    );
    expect(bySpeciality['Cardiologia']).toBe(2);
    expect(bySpeciality['Clínica Geral']).toBe(1);
    expect(bySpeciality['Não especificada']).toBe(2);
  });

  it('maps daily and monthly series with bigint counts converted to numbers', async () => {
    const result = await service.getOverview({});

    expect(result.appointments.dailySeries).toEqual([
      { date: '2026-07-01', count: 2 },
      { date: '2026-07-02', count: 4 },
    ]);
    expect(result.appointments.monthlySeries).toEqual([
      { month: '2026-07', count: 8 },
    ]);
  });

  it('splits pending requests into future and overdue', async () => {
    const result = await service.getOverview({});

    expect(result.pendingRequests).toEqual({ total: 3, future: 2, overdue: 1 });
  });

  it('computes vulnerability percentage rounded to one decimal place', async () => {
    const result = await service.getOverview({});

    expect(result.questionnaires.totalAnswered).toBe(4);
    expect(result.questionnaires.vulnerableCount).toBe(1);
    expect(result.questionnaires.vulnerablePercentage).toBe(25);
    expect(result.questionnaires.byAnsweredBy).toEqual({
      PATIENT: 3,
      MANAGER: 1,
    });
  });

  it('returns zero vulnerability percentage when there are no responses in range', async () => {
    repository.countQuestionnairesByVulnerability.mockResolvedValue([]);

    const result = await service.getOverview({});

    expect(result.questionnaires.totalAnswered).toBe(0);
    expect(result.questionnaires.vulnerablePercentage).toBe(0);
  });

  it('labels missing gender as "Não informado" and buckets patients by age', async () => {
    const result = await service.getOverview({});

    const byGender = Object.fromEntries(
      result.demographics.byGender.map((b) => [b.label, b.count]),
    );
    expect(byGender['FEMININO']).toBe(3);
    expect(byGender['Não informado']).toBe(1);

    const byAge = Object.fromEntries(
      result.demographics.byAgeBracket.map((b) => [b.label, b.count]),
    );
    expect(byAge['18-29']).toBe(1);
    expect(byAge['60+']).toBe(1);
    expect(byAge['Não informado']).toBe(1);
  });

  it('reports role and status distribution from the repository', async () => {
    const result = await service.getOverview({});

    expect(result.demographics.byRole).toEqual([
      { label: 'PATIENT', count: 10 },
      { label: 'PROFESSIONAL', count: 2 },
    ]);
    expect(result.demographics.byStatus).toEqual([
      { label: 'VERIFIED', count: 9 },
      { label: 'PENDING', count: 3 },
    ]);
  });

  it('defaults to a 30-day window ending today when no dates are given', async () => {
    await service.getOverview({});

    const [start, end] = repository.countAppointmentsByStatus.mock.calls[0];
    expect(start.getUTCHours()).toBe(0);
    expect(end.getUTCHours()).toBe(23);

    const today = new Date();
    expect(end.getUTCFullYear()).toBe(today.getUTCFullYear());
    expect(end.getUTCMonth()).toBe(today.getUTCMonth());
    expect(end.getUTCDate()).toBe(today.getUTCDate());

    const spanDays = Math.round(
      (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
    );
    expect(spanDays).toBe(31);
  });
});
