import { api } from "../lib/api";
import { AxiosError } from "axios";
import Cookies from "js-cookie";
import {
  AUTH_TOKEN_KEY,
  QUESTIONNAIRE_COMPLETED_KEY,
  USER_KEY,
  USER_STATUS,
} from "../lib/auth-constants";

export interface RegisterPatientDto {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  dateOfBirth: Date | null;
  gender: string;
  password: string;
}

export interface RegisterProfessionalDto {
  name: string;
  email: string;
  cpf: string;
  professionalLicense: string;
  specialty: string[];
  modality: "VIRTUAL" | "HOME_VISIT" | "CLINIC";
  bio?: string;
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    referenceLink?: string;
    other?: string;
  };
  password: string;
}

export interface RegisterManagerDto {
  email: string;
  password: string;
  phone: string;
  bio?: string;
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
  role: "PROFESSIONAL" | "PATIENT" | "ADMIN" | "MANAGER";
  status: "PENDING" | "COMPLETED" | "VERIFIED" | "BLOCKED";
  emailVerified: boolean;
  patientProfile?: {
    questionnaireCompleted: boolean;
  } | null;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

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

  async registerManager(data: RegisterManagerDto) {
    try {
      const response = await api.post("/auth/register/manager", data);
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

        if (user.role === "PATIENT") {
          Cookies.set(
            QUESTIONNAIRE_COMPLETED_KEY,
            String(Boolean(user.patientProfile?.questionnaireCompleted)),
            { expires: 1 },
          );
        } else {
          Cookies.remove(QUESTIONNAIRE_COMPLETED_KEY);
        }
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

  async verifyEmail(token: string) {
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      return response.data as { message: string };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(
          error.response.data.message || "Token inválido ou expirado.",
        );
      }
      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async resendVerification(email: string) {
    try {
      const response = await api.post("/auth/resend-verification", { email });
      return response.data as { message: string };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(
          error.response.data.message || "Erro ao reenviar verificação.",
        );
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
    Cookies.remove(QUESTIONNAIRE_COMPLETED_KEY);

    window.location.href = "/auth/login";
  },

  getUserStatus() {
    if (typeof window === "undefined") return null;
    const userJson = localStorage.getItem(USER_STATUS);
    return userJson;
  },
};
