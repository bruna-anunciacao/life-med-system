import { api } from "../lib/api";
import { AxiosError } from "axios";

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
  };
  questionnaire?: QuestionnaireSummary | null;
}

export interface CreateAppointmentDto {
  patientId: string;
  professionalId: string;
  dateTime: string;
  notes?: string;
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

  async listPatients() {
    try {
      const response = await api.get("/manager/patients");
      return response.data;
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

  async listAppointments() {
    try {
      const response = await api.get("/manager/appointments");
      return response.data;
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

  async listProfessionals() {
    try {
      const response = await api.get("/professional");
      return response.data;
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
