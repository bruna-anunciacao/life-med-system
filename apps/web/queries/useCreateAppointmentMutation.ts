import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  appointmentsService,
  CreateAppointmentPatientDto,
} from "../services/appointments-service";

export function useCreateAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAppointmentPatientDto) =>
      appointmentsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    },
  });
}
