import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { professionalService } from "@/services/professional-service";
import { appointmentsService } from "@/services/appointments-service";
import { toast } from "sonner";

export function useProfessionalSettingsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["professionalSettings"],
    queryFn: () => professionalService.getSettings(),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProfessionalAppointmentsQuery(params?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["professionalAppointments", params],
    queryFn: () => appointmentsService.listProfessionalAppointments(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useUpdateAppointmentStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string, notes?: string }) =>
      appointmentsService.updateStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["daily-schedule"],
      });

      queryClient.invalidateQueries({
        queryKey: ["professionalAppointments"],
      });

      toast.success("Status atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar status.");
    },
  });
}
