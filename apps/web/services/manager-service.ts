import { api } from "../lib/api";
import { AxiosError } from "axios";
import { MAX_PAGE_SIZE, type Paginated } from "../lib/pagination";

export type PatientApprovalStatus = "APPROVED" | "PENDING" | "REJECTED";

export interface CreatePatientDto {
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  dateOfBirth?: string;
  gender?: string;
  address: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
  };
}

export interface UpdatePatientDto {
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface QuestionnaireAnswerSummary {
  id: string;
  questionId: string;
  optionId: string;
  question?: { id: string; label: string };
  option?: { id: string; label: string; score: number };
}

export interface QuestionnaireSummary {
  id: string;
  answeredBy: "PATIENT" | "MANAGER";
  answeredByUserId: string;
  totalScore: number;
  isVulnerable: boolean;
  responseDate: string;
  answers?: QuestionnaireAnswerSummary[];
}

export interface ManagerPatientResponse {
  id: string;
  email: string;
  name: string;
  cpf?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  patientProfile?: {
    id: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    questionnaireCompleted?: boolean;
    approvalStatus?: PatientApprovalStatus;
    questionnaire?: QuestionnaireSummary | null;
  };
  questionnaire?: QuestionnaireSummary | null;
}

export interface ManagerProfessionalResponse {
  id: string;
  name: string;
  email: string;
  status: string;
  professionalProfile?: {
    id?: string;
    specialty?: string;
    professionalLicense?: string;
    modality?: string;
    bio?: string;
    photoUrl?: string;
    specialities?: { id: string; name: string }[];
  } | null;
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

export interface CreateAppointmentDto {
  patientId: string;
  professionalId: string;
  dateTime: string;
  notes?: string;
}

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type AppointmentSortOrder = "asc" | "desc";

export interface ListAppointmentsParams {
  sortBy?: "vulnerabilityScore";
  order?: AppointmentSortOrder;
}

export interface ManagementAppointment {
  id: string;
  dateTime: string;
  status: AppointmentStatus;
  notes: string | null;
  modality: "VIRTUAL" | "HOME_VISIT" | "CLINIC";
  meetLink: string | null;
  createdAt: string;
  patient: { id: string; name: string; email: string };
  professional: { id: string; name: string; email: string };
  scheduledByManager: { user: { name: string } } | null;
  cancelledByManager: { user: { name: string } } | null;
  totalScore: number | null;
  isVulnerable: boolean | null;
}

export const managerService = {
  async createPatient(data: CreatePatientDto) {
    try {
      const response = await api.post("/manager/patients", data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao cadastrar paciente.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },
  async updatePatient(patientId: string, data: UpdatePatientDto) {
    try {
      const response = await api.patch(`/manager/patients/${patientId}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao atualizar paciente.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async updatePatientApprovalStatus(
    patientId: string,
    approvalStatus: PatientApprovalStatus,
  ) {
    try {
      const response = await api.patch(
        `/manager/patients/${patientId}/approval-status`,
        { approvalStatus },
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao atualizar aprovação do paciente.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async listPatients(): Promise<ManagerPatientResponse[]> {
    try {
      const response = await api.get<Paginated<ManagerPatientResponse>>(
        "/manager/patients",
        { params: { limit: MAX_PAGE_SIZE } },
      );
      // A tela de pacientes (e a home do gestor) filtra/agrega a lista inteira
      // no cliente, então desembrulhamos o envelope e devolvemos o array.
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao listar pacientes.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async createAppointment(data: CreateAppointmentDto) {
    try {
      const response = await api.post("/manager/appointments", data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao agendar consulta.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async listAppointments(
    params?: ListAppointmentsParams,
  ): Promise<ManagementAppointment[]> {
    try {
      const response = await api.get<Paginated<ManagementAppointment>>(
        "/manager/appointments",
        // A view (ManagementAppointmentsView) filtra/ordena/agrega a lista
        // inteira no cliente (busca, filtro por status, stat cards). O sort por
        // vulnerabilidade é resolvido no servidor via `sortBy`/`order`. Pedimos
        // o cap de 100 e desembrulhamos o envelope { data, meta }.
        { params: { limit: MAX_PAGE_SIZE, ...params } },
      );
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao listar consultas.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async cancelAppointment(appointmentId: string, reason?: string) {
    try {
      const response = await api.patch(
        `/manager/appointments/${appointmentId}/cancel`,
        { reason },
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao cancelar consulta.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async listProfessionals(): Promise<ManagerProfessionalResponse[]> {
    try {
      // `/professional` agora é paginado ({ data, meta }). Esta tela filtra por
      // busca/especialidade/localização no cliente (as opções de localização
      // derivam do conjunto inteiro), então pedimos o cap de 100 e
      // desembrulhamos, mantendo a paginação da grade no cliente.
      const response = await api.get<Paginated<ManagerProfessionalResponse>>(
        "/professional",
        { params: { limit: MAX_PAGE_SIZE } },
      );
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao listar profissionais.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async getPatient(patientId: string) {
    try {
      const response = await api.get<ManagerPatientResponse>(
        `/manager/patients/${patientId}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao carregar dados do paciente.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },
};
