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

export const professionalsService = {
  async listAll(): Promise<ProfessionalUser[]> {
    try {
      // `/professional` agora é paginado ({ data, meta }). A busca de médicos do
      // paciente filtra por busca/especialidade/localização no cliente, então
      // pedimos o cap de 100 e desembrulhamos o envelope.
      const response = await api.get<Paginated<ProfessionalUser>>(
        API_ROUTES.PROFESSIONALS.LIST,
        { params: { limit: MAX_PAGE_SIZE } },
      );
      return response.data.data;
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
