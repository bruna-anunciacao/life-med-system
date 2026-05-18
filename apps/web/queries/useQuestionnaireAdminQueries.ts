import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdminCreateQuestionInput,
  AdminOptionInput,
  AdminUpdateOptionInput,
  AdminUpdateQuestionInput,
  questionnaireAdminService,
} from "../services/questionnaire-service";

const ADMIN_KEY = ["admin-questionnaire"] as const;

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ADMIN_KEY });
  queryClient.invalidateQueries({ queryKey: ["questionnaire-definition"] });
}

export function useAdminQuestionnaireQuery() {
  return useQuery({
    queryKey: ADMIN_KEY,
    queryFn: () => questionnaireAdminService.getActive(),
  });
}

export function useUpdateThresholdMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, threshold }: { id: string; threshold: number }) =>
      questionnaireAdminService.updateThreshold(id, threshold),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useCreateQuestionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: AdminCreateQuestionInput;
    }) => questionnaireAdminService.createQuestion(id, input),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateQuestionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      questionId,
      input,
    }: {
      id: string;
      questionId: string;
      input: AdminUpdateQuestionInput;
    }) => questionnaireAdminService.updateQuestion(id, questionId, input),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeleteQuestionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      questionId,
    }: {
      id: string;
      questionId: string;
    }) => questionnaireAdminService.deleteQuestion(id, questionId),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useCreateOptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      questionId,
      input,
    }: {
      id: string;
      questionId: string;
      input: AdminOptionInput;
    }) => questionnaireAdminService.createOption(id, questionId, input),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateOptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      optionId,
      input,
    }: {
      id: string;
      optionId: string;
      input: AdminUpdateOptionInput;
    }) => questionnaireAdminService.updateOption(id, optionId, input),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeleteOptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      optionId,
    }: {
      id: string;
      optionId: string;
    }) => questionnaireAdminService.deleteOption(id, optionId),
    onSuccess: () => invalidateAll(queryClient),
  });
}
