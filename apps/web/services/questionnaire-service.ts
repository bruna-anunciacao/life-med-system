import { AxiosError } from "axios";
import { api } from "../lib/api";

export type QuestionnaireQuestion = {
  id:
    | "familyIncomeBracket"
    | "dependentsBracket"
    | "hasUnemployedFamilyMember"
    | "hasCadUnico"
    | "ownsHome"
    | "hasPipedWater"
    | "hasBasicSanitation";
  label: string;
  type: "select" | "boolean";
  options: Array<{
    value: string;
    label: string;
  }>;
};

export type QuestionnaireAnswers = {
  familyIncomeBracket:
    | "ATE_1_SM"
    | "ENTRE_1_E_2_SM"
    | "ENTRE_2_E_3_SM"
    | "ACIMA_3_SM";
  dependentsBracket: "ATE_2" | "TRES_OU_MAIS";
  hasUnemployedFamilyMember: boolean;
  hasCadUnico: boolean;
  ownsHome: boolean;
  hasPipedWater: boolean;
  hasBasicSanitation: boolean;
};

export interface QuestionnaireDefinitionResponse {
  questions: QuestionnaireQuestion[];
  vulnerabilityThreshold: number;
}

export interface QuestionnaireSubmitResponse {
  id: string;
  patientId: string;
  answeredBy: "PATIENT" | "MANAGER";
  answeredByUserId: string;
  totalScore: number;
  isVulnerable: boolean;
  responseDate: string;
  responses: QuestionnaireAnswers;
}

function normalizeError(error: unknown, fallback: string): never {
  if (error instanceof AxiosError && error.response) {
    const message = error.response.data.message;

    if (Array.isArray(message)) {
      throw new Error(message.join(", "));
    }

    throw new Error(message || fallback);
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

  async submitSelf(data: QuestionnaireAnswers): Promise<QuestionnaireSubmitResponse> {
    try {
      const response = await api.post<QuestionnaireSubmitResponse>(
        "/questionnaire",
        data,
      );
      return response.data;
    } catch (error) {
      normalizeError(error, "Erro ao enviar questionário.");
    }
  },

  async submitForManager(
    patientId: string,
    data: QuestionnaireAnswers,
  ): Promise<QuestionnaireSubmitResponse> {
    try {
      const response = await api.post<QuestionnaireSubmitResponse>(
        `/manager/patients/${patientId}/questionnaire`,
        data,
      );
      return response.data;
    } catch (error) {
      normalizeError(error, "Erro ao enviar questionário do paciente.");
    }
  },

  async updateForManager(
    patientId: string,
    data: QuestionnaireAnswers,
  ): Promise<QuestionnaireSubmitResponse> {
    try {
      const response = await api.put<QuestionnaireSubmitResponse>(
        `/manager/patients/${patientId}/questionnaire`,
        data,
      );
      return response.data;
    } catch (error) {
      normalizeError(error, "Erro ao atualizar questionário do paciente.");
    }
  },
};
