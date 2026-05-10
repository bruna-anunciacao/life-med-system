import { api } from "../lib/api";
import { AxiosError } from "axios";
import { API_ROUTES } from "../constants/api-routes";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "PATIENT" | "PROFESSIONAL" | "MANAGER";
  status: "PENDING" | "COMPLETED" | "VERIFIED" | "BLOCKED";
  emailVerified: boolean;
  patientProfile?: {
    id: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    questionnaireCompleted: boolean;
  } | null;
  professionalProfile?: {
    id?: string;
    professionalLicense?: string;
    modality?: string;
    bio?: string;
    photoUrl?: string;
    specialities?: { id: string; name: string }[];
  } | null;
}

export interface AdminUsersParams {
  role?: "PATIENT" | "PROFESSIONAL" | "MANAGER";
  status?: "PENDING" | "COMPLETED" | "VERIFIED" | "BLOCKED";
  search?: string;
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

export const adminService = {
  async listUsers(params?: AdminUsersParams): Promise<AdminUser[]> {
    try {
      const response = await api.get(API_ROUTES.ADMIN.USERS, { params });
      return response.data;
    } catch (error) {
      return handleError(error, "Erro ao listar usuários.");
    }
  },

  async listProfessionals(): Promise<AdminUser[]> {
    try {
      const response = await api.get(API_ROUTES.ADMIN.USERS, {
        params: { role: "PROFESSIONAL" },
      });
      return response.data;
    } catch (error) {
      return handleError(error, "Erro ao listar profissionais.");
    }
  },

  async verifyUser(userId: string, emailVerified: boolean) {
    try {
      const response = await api.patch(API_ROUTES.ADMIN.VERIFY(userId), {
        emailVerified,
      });
      return response.data;
    } catch (error) {
      return handleError(error, "Erro ao verificar usuário.");
    }
  },

  async updateUser(userId: string, data: Record<string, unknown>) {
    try {
      const response = await api.patch(
        API_ROUTES.ADMIN.UPDATE_USER(userId),
        data,
      );
      return response.data;
    } catch (error) {
      return handleError(error, "Erro ao atualizar dados do usuário.");
    }
  },
};
