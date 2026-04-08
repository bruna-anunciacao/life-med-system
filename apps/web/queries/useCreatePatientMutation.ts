import { useMutation, useQueryClient } from "@tanstack/react-query";
import { managerService, CreatePatientDto } from "../services/manager-service";

export function useCreatePatientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientDto) => managerService.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
