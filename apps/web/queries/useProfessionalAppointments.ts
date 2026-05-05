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

export function useScheduleBlocksQuery() {
  return useQuery({
    queryKey: ["scheduleBlocks"],
    queryFn: () => professionalService.getScheduleBlocks(),
  });
}

export function useCreateScheduleBlockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { date: string; startTime?: string; endTime?: string }) =>
      professionalService.createScheduleBlock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduleBlocks"] });
      queryClient.invalidateQueries({ queryKey: ["daily-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["professionalAppointments"] });
      toast.success("Agenda bloqueada e consultas afetadas canceladas.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao bloquear agenda.");
    },
  });
}

export function useDeleteScheduleBlockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => professionalService.deleteScheduleBlock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduleBlocks"] });
      queryClient.invalidateQueries({ queryKey: ["daily-schedule"] });
      toast.success("Bloqueio removido com sucesso.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao remover bloqueio.");
    },
  });
}
