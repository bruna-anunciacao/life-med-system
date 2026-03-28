import { api } from "../lib/api";
import { AxiosError } from "axios";

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  cpf?: string;
  professionalLicense?: string;
  specialty?: string;
  subspecialty?: string;
  bio?: string;
  photoUrl?: string;
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    other?: string;
  };
  modality?: "VIRTUAL" | "HOME_VISIT" | "CLINIC";
  status?: "PENDING" | "VERIFIED" | "BLOCKED" | "COMPLETED";
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

  async updateProfile(data: UpdateProfileDto) {
    try {
      const response = await api.patch("/users/me", data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;
        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }
        throw new Error(message || "Erro ao atualizar perfil.");
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

  async getUserById(id: string) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao buscar dados do usuário.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async updateUser(id: string, data: UpdateProfileDto) {
    try {
      const response = await api.patch(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao atualizar dados do usuário.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async verifyUser(userId: string, emailVerified: boolean) {
    try {
      const response = await api.patch(`/users/${userId}/verify`, {
        emailVerified,
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao verificar usuário.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },
};
