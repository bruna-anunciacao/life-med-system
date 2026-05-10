import { api } from "../lib/api";
import { AxiosError } from "axios";

export interface AddressDto {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
}

export interface SearchCepResponse {
  zipCode: string;
  street: string;
  district: string;
  city: string;
  state: string;
}

export const addressService = {
  async searchByCep(cep: string) {
    try {
      const response = await api.get<SearchCepResponse>(
        `/addresses/cep/${cep}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "CEP não encontrado.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async getUserAddress(userId: string) {
    try {
      const response = await api.get<AddressDto>(`/addresses/user/${userId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }

      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao buscar endereço.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async createAddress(userId: string, data: AddressDto) {
    try {
      const response = await api.post<AddressDto>(
        `/addresses/user/${userId}`,
        data,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao criar endereço.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },

  async updateAddress(userId: string, data: AddressDto) {
    try {
      const response = await api.put<AddressDto>(
        `/addresses/user/${userId}`,
        data,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message = error.response.data.message;

        if (Array.isArray(message)) {
          throw new Error(message.join(", "));
        }

        throw new Error(message || "Erro ao atualizar endereço.");
      }

      throw new Error("Erro de conexão com o servidor.");
    }
  },
};
