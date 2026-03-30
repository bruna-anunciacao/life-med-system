import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gestorService, CreatePatientDto } from "../services/gestor-service";

export function useCreatePatientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientDto) => gestorService.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
