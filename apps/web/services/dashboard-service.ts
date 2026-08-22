import { api } from "../lib/api";
import { AxiosError } from "axios";
import { API_ROUTES } from "../constants/api-routes";

export interface DashboardCountBucket {
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
    bySpeciality: DashboardCountBucket[];
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
    byGender: DashboardCountBucket[];
    byAgeBracket: DashboardCountBucket[];
    byRole: DashboardCountBucket[];
    byStatus: DashboardCountBucket[];
  };
}

export interface DashboardOverviewParams {
  startDate?: string;
  endDate?: string;
}

const handleError = (error: unknown, fallback: string): never => {
  if (error instanceof AxiosError && error.response) {
    const message = error.response.data.message;
    throw new Error(
      Array.isArray(message) ? message.join(", ") : message || fallback,
    );
  }
  throw new Error("Erro de conexão com o servidor.");
};

export const dashboardService = {
  async getOverview(params: DashboardOverviewParams): Promise<DashboardOverview> {
    try {
      const response = await api.get(API_ROUTES.DASHBOARD.OVERVIEW, {
        params,
      });
      return response.data as DashboardOverview;
    } catch (error) {
      return handleError(error, "Erro ao carregar indicadores do dashboard.");
    }
  },
};
