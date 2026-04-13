import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  questionnaireService,
  QuestionnaireAnswers,
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
    mutationFn: (data: QuestionnaireAnswers) =>
      questionnaireService.submitSelf(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useManagerSubmitQuestionnaireMutation(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuestionnaireAnswers) =>
      questionnaireService.submitForManager(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useManagerUpdateQuestionnaireMutation(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuestionnaireAnswers) =>
      questionnaireService.updateForManager(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
