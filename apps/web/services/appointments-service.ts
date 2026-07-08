import { api } from "../lib/api";
import { AxiosError } from "axios";
import type { Paginated } from "../lib/pagination";

export interface CreateAppointmentPatientDto {
  professionalId: string;
  dateTime: string;
  notes?: string;
  patientId?: string;
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
  appointmentDurationMinutes: number;
  slots: AppointmentSlot[];
}

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type AppointmentModality = "VIRTUAL" | "HOME_VISIT" | "CLINIC";

export interface AppointmentResponse {
  id: string;
  dateTime: string;
  status: AppointmentStatus;
  modality: AppointmentModality;
  meetLink?: string | null;
  notes?: string;
  createdAt: string;
  professional: {
    id: string;
    name: string;
    email: string;
    specialties?: string[];
    photoUrl?: string | null;
    bio?: string | null;
  };
  patient: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

export type AppointmentListResponse = Paginated<AppointmentResponse>;

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

  async createForManager(data: CreateAppointmentPatientDto) {
    try {
      const response = await api.post("/appointments/manager", data);
      return response.data as AppointmentResponse;
    } catch (error) {
      extractErrorMessage(error, "Erro ao agendar consulta.");
    }
  },

  async listMyAppointments(params?: {
    status?: string | string[];
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      // O backend aceita `status` único ou múltiplos separados por vírgula
      // (?status=PENDING,CONFIRMED). Serializamos array nesse formato.
      const { status, ...rest } = params ?? {};
      const response = await api.get("/appointments/my-appointments", {
        params: {
          ...rest,
          ...(status && {
            status: Array.isArray(status) ? status.join(",") : status,
          }),
        },
      });
      return response.data as AppointmentListResponse;
    } catch (error) {
      extractErrorMessage(error, "Erro ao listar consultas.");
    }
  },

  async listProfessionalAppointments(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await api.get(
        "/appointments/professional-appointments",
        {
          params,
        },
      );
      return response.data as AppointmentListResponse;
    } catch (error) {
      extractErrorMessage(
        error,
        "Erro ao listar agendamentos do profissional.",
      );
    }
  },

  async updateStatus(appointmentId: string, status: string, notes?: string) {
    try {
      const response = await api.patch(
        `/appointments/${appointmentId}/status`,
        {
          status,
          notes,
        },
      );
      return response.data as AppointmentResponse;
    } catch (error) {
      extractErrorMessage(error, "Erro ao atualizar status da consulta.");
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
