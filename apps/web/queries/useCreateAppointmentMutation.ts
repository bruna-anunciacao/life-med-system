import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  managerService,
  CreateAppointmentDto,
} from "../services/manager-service";

export function useCreateAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentDto) =>
      managerService.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
