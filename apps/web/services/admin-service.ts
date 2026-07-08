import { api } from "../lib/api";
import { AxiosError } from "axios";
import { API_ROUTES } from "../constants/api-routes";
import { MAX_PAGE_SIZE, type Paginated } from "../lib/pagination";

export type PatientApprovalStatus = "APPROVED" | "PENDING" | "REJECTED";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "PATIENT" | "PROFESSIONAL" | "MANAGER";
  status: "PENDING" | "COMPLETED" | "VERIFIED" | "BLOCKED";
  emailVerified: boolean;
  createdAt?: string;
  patientProfile?: {
    id: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    questionnaireCompleted: boolean;
    approvalStatus: PatientApprovalStatus;
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
      const response = await api.get(API_ROUTES.ADMIN.USERS, {
        params: { limit: MAX_PAGE_SIZE, ...params },
      });
      // A tabela de usuários filtra/ordena tudo no cliente (busca fuzzy, abas
      // por role). Desembrulhamos o envelope { data, meta } e devolvemos o array.
      const payload = response.data as Paginated<AdminUser>;
      return payload.data;
    } catch (error) {
      return handleError(error, "Erro ao listar usuários.");
    }
  },

  async listProfessionals(): Promise<AdminUser[]> {
    try {
      const response = await api.get(API_ROUTES.ADMIN.USERS, {
        params: { role: "PROFESSIONAL", limit: MAX_PAGE_SIZE },
      });
      const payload = response.data as Paginated<AdminUser>;
      return payload.data;
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

  async updatePatientApprovalStatus(
    patientId: string,
    approvalStatus: PatientApprovalStatus,
  ) {
    try {
      const response = await api.patch(
        `/admin/patients/${patientId}/approval-status`,
        { approvalStatus },
      );
      return response.data;
    } catch (error) {
      return handleError(
        error,
        "Erro ao atualizar status de aprovação do paciente.",
      );
    }
  },
};
