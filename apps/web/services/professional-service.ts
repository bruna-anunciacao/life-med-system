import { api } from "../lib/api";
import { AxiosError } from "axios";

export interface UpdateSettingsPayload {
  modality: string;
  address?: string;
  payments: string[];
  price: number;
  availability: {
    dayOfWeek: number;
    start: string;
    end: string;
  }[];
}

export interface PatientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
}

export interface PatientDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  history: {
    id: string;
    dateTime: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
    notes?: string;
  }[];
}

export const professionalService = {
  async getSettings() {
    try {
      const response = await api.get("/professional/settings");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(
          error.response.data.message || "Erro ao buscar configurações.",
        );
      }
      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async getDailySchedule(date: string, professionalId?: string) {
    try {
      const endpoint = professionalId
        ? `/professional/${professionalId}/schedule?date=${date}`
        : `/professional/schedule?date=${date}`;
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(
          error.response.data.message || "Erro ao buscar a agenda.",
        );
      }
      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async getPatients(): Promise<PatientProfile[]> {
    try {
      const response = await api.get("/professional/patients");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(
          error.response.data.message || "Erro ao buscar pacientes.",
        );
      }
      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async getPatientDetail(patientId: string): Promise<PatientDetail> {
    try {
      const response = await api.get(`/professional/patients/${patientId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(
          error.response.data.message || "Erro ao buscar detalhes do paciente.",
        );
      }
      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async updateSettings(data: UpdateSettingsPayload) {
    try {
      const response = await api.patch("/professional/settings", data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao atualizar configurações.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async createScheduleBlock(data: { date: string; startTime?: string; endTime?: string }) {
    try {
      const response = await api.post("/professional/schedule-blocks", data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || "Erro ao criar bloqueio.");
      }
      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async getScheduleBlocks() {
    try {
      const response = await api.get("/professional/schedule-blocks");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || "Erro ao buscar bloqueios.");
      }
      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async deleteScheduleBlock(id: string) {
    try {
      const response = await api.delete(`/professional/schedule-blocks/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || "Erro ao remover bloqueio.");
      }
      throw new Error("Erro de conexão com o servidor.");
    }
  },
};
