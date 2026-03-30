import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  gestorService,
  CreateAppointmentDto,
} from "../services/gestor-service";

export function useCreateAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentDto) =>
      gestorService.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
