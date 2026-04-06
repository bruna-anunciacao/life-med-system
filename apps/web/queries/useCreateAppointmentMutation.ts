import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsService, CreateAppointmentPayload } from "../services/appointments-service";

export function useCreateAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) =>
      appointmentsService.createAppointment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    },
  });
}
