import { api } from "../lib/api";
import { AxiosError } from "axios";
import Cookies from "js-cookie";
import { QUESTIONNAIRE_COMPLETED_KEY } from "../lib/auth-constants";

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  cpf?: string;
  professionalLicense?: string;
  specialty?: string[];
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

const ALLOWED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

function validateProfilePhoto(photo: File): void {
  if (!ALLOWED_PHOTO_MIME_TYPES.includes(photo.type)) {
    throw new Error("Formato de imagem não permitido. Use JPEG, PNG ou WebP.");
  }
  if (photo.size > MAX_PHOTO_SIZE_BYTES) {
    throw new Error("A imagem deve ter no máximo 5 MB.");
  }
}

function buildProfileFormData(
  data: UpdateProfileDto,
  photo: File,
): FormData {
  const formData = new FormData();
  formData.append("photo", photo);
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, v));
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
}

export const usersService = {
  async getUser() {
    try {
      const response = await api.get("/users/me");
      const user = response.data;

      if (typeof window !== "undefined" && user?.role === "PATIENT") {
        Cookies.set(
          QUESTIONNAIRE_COMPLETED_KEY,
          String(Boolean(user.patientProfile?.questionnaireCompleted)),
          { expires: 1 },
        );
      }
      return user;
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

  async updateProfile(data: UpdateProfileDto, photo?: File) {
    try {
      if (photo) {
        validateProfilePhoto(photo);
      }

      const body: FormData | UpdateProfileDto = photo
        ? buildProfileFormData(data, photo)
        : data;

      const response = await api.patch("/users/me", body);
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
      const response = await api.patch(`/admin/user/${id}`, data);
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
      const response = await api.patch(`/admin/verify/${userId}`, {
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
