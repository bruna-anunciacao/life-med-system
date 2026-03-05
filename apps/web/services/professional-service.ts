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

  async getDailySchedule(date: string) {
    try {
      const response = await api.get(`/professional/schedule?date=${date}`);
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
};
