import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  appointmentsService,
  AppointmentListResponse,
  AppointmentResponse,
  CancelAppointmentDto,
} from "../services/appointments-service";

export function useCancelAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CancelAppointmentDto }) =>
      appointmentsService.cancel(id, data),

    onSuccess: (updated) => {
      if (!updated) return;

      queryClient.setQueryData<AppointmentListResponse>(["my-appointments"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((a: AppointmentResponse) =>
            a.id === updated.id ? updated : a,
          ),
        };
      });

      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
