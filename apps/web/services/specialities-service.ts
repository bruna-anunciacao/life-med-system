import { api } from "../lib/api";
import { AxiosError } from "axios";

export const specialitiesService = {
    async getAll() {
        try {
            const response = await api.get("/speciality");
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                throw new Error(
                    error.response.data.message || "Erro ao buscar especialidades.",
                );
            }
            throw new Error("Erro de conexão com o servidor.");
        }
    },

    async create(name: string) {
        try {
            const response = await api.post("/speciality", { name });
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                const message = error.response.data.message;

                if (Array.isArray(message)) {
                    throw new Error(message.join(", "));
                }

                throw new Error(message || "Erro ao criar especialidade.");
            }

            throw new Error("Erro de conexão com o servidor.");
        }
    },

    async update(id: string, name: string) {
        try {
            const response = await api.patch(`/speciality/${id}`, { name });
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                throw new Error(error.response.data.message || "Erro ao atualizar.");
            }
            throw new Error("Erro de conexão.");
        }
    },

    async delete(id: string) {
        try {
            const response = await api.delete(`/speciality/${id}`);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                throw new Error(error.response.data.message || "Erro ao deletar.");
            }
            throw new Error("Erro de conexão.");
        }
    },
};