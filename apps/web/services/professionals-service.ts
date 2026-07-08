import { api } from "../lib/api";
import { AxiosError } from "axios";
import { API_ROUTES } from "../constants/api-routes";
import { MAX_PAGE_SIZE, type Paginated } from "../lib/pagination";

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
  address?: {
    zipCode?: string | null;
    street?: string | null;
    number?: string | null;
    complement?: string | null;
    district?: string | null;
    city?: string | null;
    state?: string | null;
  } | null;
}

export interface ProfessionalLocation {
  city: string;
  state: string;
}

export interface ListProfessionalsParams {
  page?: number;
  limit?: number;
  search?: string;
  speciality?: string;
  city?: string;
  state?: string;
}

function extractErrorMessage(error: unknown, fallback: string): never {
  if (error instanceof AxiosError && error.response) {
    const message = error.response.data.message;
    throw new Error(
      Array.isArray(message) ? message.join(", ") : message || fallback,
    );
  }
  throw new Error("Erro de conexão com o servidor.");
}

export const professionalsService = {
  /** Lista paginada de profissionais visíveis (exclui PENDING/BLOCKED), com busca/filtros server-side. */
  async list(
    params: ListProfessionalsParams = {},
  ): Promise<Paginated<ProfessionalUser>> {
    try {
      const response = await api.get<Paginated<ProfessionalUser>>(
        API_ROUTES.PROFESSIONALS.LIST,
        { params },
      );
      return response.data;
    } catch (error) {
      extractErrorMessage(error, "Erro ao listar profissionais.");
    }
  },

  /** @deprecated Use `list()` com paginação. Mantido para telas que ainda precisam do array completo. */
  async listAll(): Promise<ProfessionalUser[]> {
    try {
      const response = await api.get<Paginated<ProfessionalUser>>(
        API_ROUTES.PROFESSIONALS.LIST,
        { params: { limit: MAX_PAGE_SIZE } },
      );
      return response.data.data;
    } catch (error) {
      extractErrorMessage(error, "Erro ao listar profissionais.");
    }
  },

  async listLocations(): Promise<ProfessionalLocation[]> {
    try {
      const response = await api.get<ProfessionalLocation[]>(
        API_ROUTES.PROFESSIONALS.LOCATIONS,
      );
      return response.data;
    } catch (error) {
      extractErrorMessage(error, "Erro ao listar localizações.");
    }
  },
};
