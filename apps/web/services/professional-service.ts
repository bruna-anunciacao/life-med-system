import { api } from "../lib/api";
import { AxiosError } from "axios";
import { MAX_PAGE_SIZE, type Paginated } from "../lib/pagination";

export interface UpdateSettingsPayload {
  modality: string;
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
  cpf: string | null;
  phone: string;
  lastVisit: string | null;
  nextVisit: string | null;
}

export interface PatientDetail {
  id: string;
  name: string;
  email: string;
  cpf: string | null;
  phone: string;
  history: {
    id: string;
    dateTime: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
    modality?: "VIRTUAL" | "HOME_VISIT" | "CLINIC";
    notes?: string;
  }[];
}

export interface ScheduleBlock {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
}

export interface DailyScheduleAppointment {
  id: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  modality?: "VIRTUAL" | "HOME_VISIT" | "CLINIC";
  notes?: string | null;
  meetLink?: string | null;
  patient: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

export interface DailyScheduleResponse {
  availability: { startTime: string; endTime: string } | null;
  scheduleBlocks: ScheduleBlock[];
  attendedPatientsCount: number;
  appointmentDurationMinutes: number;
  appointments: DailyScheduleAppointment[];
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

  async getDailySchedule(
    date: string,
    professionalId?: string,
  ): Promise<DailyScheduleResponse> {
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
      const response = await api.get("/professional/patients", {
        params: { limit: MAX_PAGE_SIZE },
      });
      // A tela filtra a lista inteira no cliente (busca por nome/CPF/telefone),
      // então desembrulhamos o envelope e devolvemos o array. Cap de 100 na API.
      const payload = response.data as Paginated<PatientProfile>;
      return payload.data;
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
      const response = await api.get(`/professional/patients/${patientId}`, {
        params: { limit: MAX_PAGE_SIZE },
      });
      // O `history` virou envelope { data, meta }. A tela de detalhe separa
      // histórico em "próxima consulta" x "passadas" e conta o total no cliente,
      // então normalizamos `history` de volta para um array simples aqui.
      const raw = response.data as Omit<PatientDetail, "history"> & {
        history: PatientDetail["history"] | Paginated<PatientDetail["history"][number]>;
      };
      const history = Array.isArray(raw.history)
        ? raw.history
        : raw.history.data;
      return { ...raw, history };
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
