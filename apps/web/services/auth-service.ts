import { api } from "../lib/api";
import { AxiosError } from "axios";

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
};