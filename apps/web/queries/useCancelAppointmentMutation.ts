import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  appointmentsService,
  CancelAppointmentDto,
} from "../services/appointments-service";

export function useCancelAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CancelAppointmentDto }) =>
      appointmentsService.cancel(id, data),

    onSuccess: (updated) => {
      if (!updated) return;

      // A lista "Minhas consultas" agora é paginada e filtrada por aba/status
      // (cache com chave variável), então invalidamos o prefixo em vez de
      // remendar uma entrada específica. Cancelar move o item entre abas, o que
      // muda os totais — reconsultar é o caminho correto.
      void queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
