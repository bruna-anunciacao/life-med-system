import { api } from "../lib/api";
import { AxiosError } from "axios";
import { API_ROUTES } from "../constants/api-routes";

export interface Location {
  city: string;
  state: string;
}

export const locationsService = {
  async getCities(): Promise<Location[]> {
    try {
      const response = await api.get(API_ROUTES.LOCATIONS.CITIES);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;
        throw new Error(
          Array.isArray(message) ? message.join(", ") : message || "Erro ao listar cidades.",
        );
      }
      throw new Error("Erro de conexão com o servidor.");
    }
  },
};
