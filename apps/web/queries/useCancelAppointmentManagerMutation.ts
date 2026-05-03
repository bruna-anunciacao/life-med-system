import { useMutation, useQueryClient } from "@tanstack/react-query";
import { managerService } from "../services/manager-service";

export function useCancelAppointmentManagerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      reason,
    }: {
      id: string;
      reason?: string;
    }) => managerService.cancelAppointment(id, reason),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
