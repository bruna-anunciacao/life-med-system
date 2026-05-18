import { AxiosError } from "axios";
import { api } from "../lib/api";

export interface QuestionnaireOption {
  id: string;
  label: string;
  score: number;
  order: number;
}

export interface QuestionnaireQuestion {
  id: string;
  label: string;
  order: number;
  options: QuestionnaireOption[];
}

export interface QuestionnaireDefinitionResponse {
  id: string;
  vulnerabilityThreshold: number;
  maxPossibleScore: number;
  questions: QuestionnaireQuestion[];
}

export interface QuestionnaireAnswerInput {
  questionId: string;
  optionId: string;
}

export interface QuestionnaireSubmitPayload {
  answers: QuestionnaireAnswerInput[];
}

export interface QuestionnaireAnswerSnapshot {
  questionId: string;
  questionLabel: string;
  optionId: string;
  optionLabel: string;
  score: number;
}

export interface QuestionnaireSubmitResponse {
  id: string;
  patientId: string;
  answeredBy: "PATIENT" | "MANAGER";
  answeredByUserId: string;
  totalScore: number;
  isVulnerable: boolean;
  responseDate: string;
  answers: QuestionnaireAnswerSnapshot[];
}

export interface QuestionnaireSubmitError extends Error {
  code?: string;
}

function normalizeError(error: unknown, fallback: string): never {
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data as
      | { message?: unknown; code?: string }
      | undefined;
    const message = data?.message;
    const flat = Array.isArray(message)
      ? message.join(", ")
      : typeof message === "string"
        ? message
        : fallback;
    const err = new Error(flat) as QuestionnaireSubmitError;
    err.code = data?.code;
    throw err;
  }
  throw new Error(fallback);
}

export const questionnaireService = {
  async getDefinition(): Promise<QuestionnaireDefinitionResponse> {
    try {
      const response = await api.get<QuestionnaireDefinitionResponse>(
        "/questionnaire/questions",
      );
      return response.data;
    } catch (error) {
      normalizeError(error, "Erro ao carregar o questionário.");
    }
  },

  async submitSelf(
    payload: QuestionnaireSubmitPayload,
  ): Promise<QuestionnaireSubmitResponse> {
    try {
      const response = await api.post<QuestionnaireSubmitResponse>(
        "/questionnaire",
        payload,
      );
      return response.data;
    } catch (error) {
      normalizeError(error, "Erro ao enviar questionário.");
    }
  },

  async submitForManager(
    patientId: string,
    payload: QuestionnaireSubmitPayload,
  ): Promise<QuestionnaireSubmitResponse> {
    try {
      const response = await api.post<QuestionnaireSubmitResponse>(
        `/manager/patients/${patientId}/questionnaire`,
        payload,
      );
      return response.data;
    } catch (error) {
      normalizeError(error, "Erro ao enviar questionário do paciente.");
    }
  },

  async updateForManager(
    patientId: string,
    payload: QuestionnaireSubmitPayload,
  ): Promise<QuestionnaireSubmitResponse> {
    try {
      const response = await api.put<QuestionnaireSubmitResponse>(
        `/manager/patients/${patientId}/questionnaire`,
        payload,
      );
      return response.data;
    } catch (error) {
      normalizeError(error, "Erro ao atualizar questionário do paciente.");
    }
  },
};

export interface AdminOptionInput {
  label: string;
  score: number;
  order: number;
}

export interface AdminCreateQuestionInput {
  label: string;
  order: number;
  options: AdminOptionInput[];
}

export interface AdminUpdateQuestionInput {
  label?: string;
  order?: number;
  isActive?: boolean;
}

export interface AdminUpdateOptionInput {
  label?: string;
  score?: number;
  order?: number;
  isActive?: boolean;
}

export const questionnaireAdminService = {
  async getActive(): Promise<QuestionnaireDefinitionResponse> {
    try {
      const response = await api.get<QuestionnaireDefinitionResponse>(
        "/admin/questionnaire",
      );
      return response.data;
    } catch (error) {
      normalizeError(error, "Erro ao carregar questionário.");
    }
  },

  async updateThreshold(
    id: string,
    vulnerabilityThreshold: number,
  ): Promise<QuestionnaireDefinitionResponse> {
    try {
      const response = await api.patch<QuestionnaireDefinitionResponse>(
        `/admin/questionnaire/${id}`,
        { vulnerabilityThreshold },
      );
      return response.data;
    } catch (error) {
      normalizeError(error, "Erro ao atualizar limiar.");
    }
  },

  async createQuestion(
    id: string,
    input: AdminCreateQuestionInput,
  ): Promise<QuestionnaireDefinitionResponse> {
    try {
      const response = await api.post<QuestionnaireDefinitionResponse>(
        `/admin/questionnaire/${id}/questions`,
        input,
      );
      return response.data;
    } catch (error) {
      normalizeError(error, "Erro ao criar pergunta.");
    }
  },

  async updateQuestion(
    id: string,
    questionId: string,
    input: AdminUpdateQuestionInput,
  ): Promise<QuestionnaireDefinitionResponse> {
    try {
      const response = await api.patch<QuestionnaireDefinitionResponse>(
        `/admin/questionnaire/${id}/questions/${questionId}`,
        input,
      );
      return response.data;
    } catch (error) {
      normalizeError(error, "Erro ao atualizar pergunta.");
    }
  },

  async deleteQuestion(
    id: string,
    questionId: string,
  ): Promise<QuestionnaireDefinitionResponse> {
    try {
      const response = await api.delete<QuestionnaireDefinitionResponse>(
        `/admin/questionnaire/${id}/questions/${questionId}`,
      );
      return response.data;
    } catch (error) {
      normalizeError(error, "Erro ao remover pergunta.");
    }
  },

  async createOption(
    id: string,
    questionId: string,
    input: AdminOptionInput,
  ): Promise<QuestionnaireDefinitionResponse> {
    try {
      const response = await api.post<QuestionnaireDefinitionResponse>(
        `/admin/questionnaire/${id}/questions/${questionId}/options`,
        input,
      );
      return response.data;
    } catch (error) {
      normalizeError(error, "Erro ao criar opção.");
    }
  },

  async updateOption(
    id: string,
    optionId: string,
    input: AdminUpdateOptionInput,
  ): Promise<QuestionnaireDefinitionResponse> {
    try {
      const response = await api.patch<QuestionnaireDefinitionResponse>(
        `/admin/questionnaire/${id}/options/${optionId}`,
        input,
      );
      return response.data;
    } catch (error) {
      normalizeError(error, "Erro ao atualizar opção.");
    }
  },

  async deleteOption(
    id: string,
    optionId: string,
  ): Promise<QuestionnaireDefinitionResponse> {
    try {
      const response = await api.delete<QuestionnaireDefinitionResponse>(
        `/admin/questionnaire/${id}/options/${optionId}`,
      );
      return response.data;
    } catch (error) {
      normalizeError(error, "Erro ao remover opção.");
    }
  },
};
