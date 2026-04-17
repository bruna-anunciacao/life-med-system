import { api } from "../lib/api";
import { AxiosError } from "axios";
import { API_ROUTES } from "../constants/api-routes";

export interface AdminPatient {
  id: string;
  name: string;
  email: string;
  status: "PENDING" | "COMPLETED" | "VERIFIED" | "BLOCKED";
  role: "PATIENT" | "PROFESSIONAL" | "ADMIN" | "MANAGER";
  emailVerified: boolean;
  patientProfile?: {
    id: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    questionnaireCompleted: boolean;
    questionnaire?: unknown;
  } | null;
}

export interface AdminProfessional {
  id: string;
  name: string;
  email: string;
  status: "PENDING" | "COMPLETED" | "VERIFIED" | "BLOCKED";
  role: "PATIENT" | "PROFESSIONAL" | "ADMIN" | "MANAGER";
  emailVerified: boolean;
  professionalProfile?: {
    id?: string;
    specialty?: string;
    professionalLicense?: string;
    modality?: string;
    bio?: string;
    photoUrl?: string;
    address?: string;
    specialities?: { id: string; name: string }[];
  } | null;
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
  async listPatients(): Promise<AdminPatient[]> {
    try {
      const response = await api.get(API_ROUTES.ADMIN.PATIENTS);
      return response.data;
    } catch (error) {
      return handleError(error, "Erro ao listar pacientes.");
    }
  },

  async listProfessionals(): Promise<AdminProfessional[]> {
    try {
      const response = await api.get(API_ROUTES.ADMIN.PROFESSIONALS);
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
