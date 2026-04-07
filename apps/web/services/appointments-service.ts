import { api } from "../lib/api";
import { AxiosError } from "axios";

export interface CreateAppointmentPatientDto {
  professionalId: string;
  dateTime: string;
  notes?: string;
}

export interface CancelAppointmentDto {
  reason?: string;
}

export interface AppointmentSlot {
  time: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  professionalId: string;
  date: string;
  slots: AppointmentSlot[];
}

export interface AppointmentResponse {
  id: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  notes?: string;
  createdAt: string;
  professional: {
    id: string;
    name: string;
    email: string;
  };
  patient: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AppointmentListResponse {
  data: AppointmentResponse[];
  page: number;
  limit: number;
  total: number;
}

function extractErrorMessage(error: unknown, fallback: string): never {
  if (error instanceof AxiosError && error.response) {
    const message = error.response.data.message;
    if (Array.isArray(message)) {
      throw new Error(message.join(", "));
    }
    throw new Error(message || fallback);
  }
  throw new Error("Erro de conexão com o servidor.");
}

export const appointmentsService = {
  async create(data: CreateAppointmentPatientDto) {
    try {
      const response = await api.post("/appointments", data);
      return response.data as AppointmentResponse;
    } catch (error) {
      extractErrorMessage(error, "Erro ao agendar consulta.");
    }
  },

  async listMyAppointments(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await api.get("/appointments/my-appointments", {
        params,
      });
      return response.data as AppointmentListResponse;
    } catch (error) {
      extractErrorMessage(error, "Erro ao listar consultas.");
    }
  },

  async cancel(appointmentId: string, data?: CancelAppointmentDto) {
    try {
      const response = await api.patch(
        `/appointments/${appointmentId}/cancel`,
        data || {},
      );
      return response.data as AppointmentResponse;
    } catch (error) {
      extractErrorMessage(error, "Erro ao cancelar consulta.");
    }
  },

  async getAvailableSlots(professionalId: string, date: string) {
    try {
      const response = await api.get(
        `/appointments/professionals/${professionalId}/available-slots`,
        { params: { date } },
      );
      return response.data as AvailableSlotsResponse;
    } catch (error) {
      extractErrorMessage(error, "Erro ao buscar horários disponíveis.");
    }
  },
};
