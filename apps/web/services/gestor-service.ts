import { api } from "../lib/api";
import { AxiosError } from "axios";

export interface CreatePatientDto {
  email: string;
  phone: string;
  cpf?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
}

export interface UpdatePatientDto {
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
}

export interface CreateAppointmentDto {
  patientId: string;
  professionalId: string;
  dateTime: string;
  notes?: string;
}

export const gestorService = {
  async createPatient(data: CreatePatientDto) {
    try {
      const response = await api.post("/gestor/patients", data);
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
      const response = await api.patch(`/gestor/patients/${patientId}`, data);
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
      const response = await api.get("/gestor/patients");
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
      const response = await api.post("/gestor/appointments", data);
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
      const response = await api.get("/gestor/appointments");
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

  async listProfessionals() {
    try {
      const response = await api.get("/professionals");
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
      const response = await api.get(`/gestor/patients/${patientId}`);
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
