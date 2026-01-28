import { api } from "../lib/api";
import { AxiosError } from "axios";
import Cookies from "js-cookie";

export interface RegisterPatientDto {
  name: string;
  email: string;
  password: string;
}

export interface RegisterProfessionalDto {
  name: string;
  email: string;
  password: string;
  professionalLicense: string;
  specialty: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "PROFESSIONAL" | "PATIENT" | "ADMIN";
  status: "PENDING" | "COMPLETED" | "VERIFIED" | "BLOCKED";
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export const AUTH_TOKEN_KEY = "auth-token";
export const USER_KEY = "user-role";
export const USER_STATUS = "user-status";

export const authService = {
  async registerPatient(data: RegisterPatientDto) {
    try {
      const response = await api.post("/auth/register", data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao realizar cadastro.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async registerProfessional(data: RegisterProfessionalDto) {
    try {
      const response = await api.post("/auth/register/professional", data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao realizar cadastro.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async login(data: LoginDto) {
    try {
      const response = await api.post<LoginResponse>("/auth/login", data);

      const { accessToken, user } = response.data;

      if (accessToken) {
        localStorage.setItem(AUTH_TOKEN_KEY, accessToken);

        Cookies.set(AUTH_TOKEN_KEY, accessToken, { expires: 1 });

        Cookies.set(USER_KEY, user.role, { expires: 1 });

        Cookies.set(USER_STATUS, user.status, { expires: 1 });
      }

      if (user) {
        localStorage.setItem(USER_KEY, user.role);
        localStorage.setItem(USER_STATUS, user.status);
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao realizar login.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async forgotPassword(data: ForgotPasswordDto) {
    try {
      const response = await api.post("/auth/forgot-password", data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao realizar esqueci a senha.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async resetPassword(data: ResetPasswordDto) {
    try {
      const response = await api.post("/auth/reset-password", data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao realizar recuperar a senha.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    Cookies.remove(AUTH_TOKEN_KEY);
    Cookies.remove(USER_KEY);
    Cookies.remove(USER_STATUS);

    window.location.href = "/auth/login";
  },

  getUser() {
    if (typeof window === "undefined") return null;
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? (JSON.parse(userJson) as User) : null;
  },
};
