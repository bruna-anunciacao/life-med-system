import { api } from "../lib/api";
import { AxiosError } from "axios";
import { API_ROUTES } from "../constants/api-routes";

export interface ProfessionalUser {
  id: string;
  name: string;
  email: string;
  status: string;
  professionalProfile?: {
    professionalLicense?: string;
    modality?: string;
    bio?: string;
    photoUrl?: string;
    socialLinks?: { linkedin?: string; instagram?: string };
    specialities?: { id: string; name: string }[];
  };
}

export const professionalsService = {
  async listAll(): Promise<ProfessionalUser[]> {
    try {
      const response = await api.get(API_ROUTES.PROFESSIONALS.LIST);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;
        throw new Error(
          Array.isArray(message) ? message.join(", ") : message || "Erro ao listar profissionais.",
        );
      }
      throw new Error("Erro de conexão com o servidor.");
    }
  },
};
