export interface CountBucket {
  label: string;
  count: number;
}

export interface DashboardOverview {
  period: {
    startDate: string;
    endDate: string;
  };
  appointments: {
    total: number;
    byStatus: Record<string, number>;
    byModality: Record<string, number>;
    bySpeciality: CountBucket[];
    dailySeries: { date: string; count: number }[];
    monthlySeries: { month: string; count: number }[];
  };
  care: {
    completedAppointments: number;
    medicalRecordsCreated: number;
  };
  pendingRequests: {
    total: number;
    future: number;
    overdue: number;
  };
  questionnaires: {
    totalAnswered: number;
    vulnerableCount: number;
    vulnerablePercentage: number;
    byAnsweredBy: Record<string, number>;
  };
  demographics: {
    byGender: CountBucket[];
    byAgeBracket: CountBucket[];
    byRole: CountBucket[];
    byStatus: CountBucket[];
  };
}
