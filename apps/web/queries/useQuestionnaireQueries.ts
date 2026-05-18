import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  questionnaireService,
  QuestionnaireSubmitPayload,
} from "../services/questionnaire-service";

export function useQuestionnaireDefinitionQuery() {
  return useQuery({
    queryKey: ["questionnaire-definition"],
    queryFn: () => questionnaireService.getDefinition(),
  });
}

export function useSubmitQuestionnaireMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuestionnaireSubmitPayload) =>
      questionnaireService.submitSelf(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["questionnaire-definition"] });
    },
  });
}

export function useManagerSubmitQuestionnaireMutation(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuestionnaireSubmitPayload) =>
      questionnaireService.submitForManager(patientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useManagerUpdateQuestionnaireMutation(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuestionnaireSubmitPayload) =>
      questionnaireService.updateForManager(patientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
