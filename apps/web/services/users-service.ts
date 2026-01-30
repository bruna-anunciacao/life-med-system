import { api } from "../lib/api";
import { AxiosError } from "axios";

export interface CompleteProfileDto {
  name?: string;
  email?: string;
  phone?: string;
  speciality?: string;
  subspeciality?: string;
  crm?: string;
  bio?: string;
  photoUrl?: string;
  modality?: "VIRTUAL" | "HOME_VISIT" | "CLINIC";
}

export const AUTH_TOKEN_KEY = "auth-token";

export const usersService = {
  async getUser() {
    try {
      const response = await api.get("/users/me");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao resgatar seus dados.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async getAllPatients() {
    try {
      const response = await api.get("/users/patients");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao resgatar os pacientes.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async getAllProfessionals() {
    try {
      const response = await api.get("/users/professionals");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao resgatar os profissionais.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async completeProfile(data: CompleteProfileDto) {
    try {
      const response = await api.patch("users/me", data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao completar o cadastro.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async updateUserStatus(userId: string, status: string) {
    try {
      const response = await api.patch(`/users/${userId}`, { status });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao atualizar o status do usuário.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },
};
