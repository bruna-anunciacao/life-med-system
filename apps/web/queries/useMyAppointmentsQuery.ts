import { useQueries, useQuery } from "@tanstack/react-query";
import { appointmentsService } from "../services/appointments-service";

type MyAppointmentsParams = {
  status?: string | string[];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export function useMyAppointmentsQuery(params?: MyAppointmentsParams) {
  return useQuery({
    queryKey: ["my-appointments", params ?? {}],
    queryFn: () => appointmentsService.listMyAppointments(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Totais por conjunto de status, para os badges das abas. Cada consulta pede
 * `limit: 1` e lê apenas `meta.total` — barato e cacheado pelo TanStack. Recebe
 * um mapa `chave -> status[]` e devolve `chave -> total`.
 */
export function useMyAppointmentsCounts<K extends string>(
  statusByKey: Record<K, string[]>,
) {
  const entries = Object.entries(statusByKey) as [K, string[]][];

  const results = useQueries({
    queries: entries.map(([key, status]) => ({
      queryKey: ["my-appointments-count", key, status],
      queryFn: () =>
        appointmentsService.listMyAppointments({ status, page: 1, limit: 1 }),
      placeholderData: (previous: Awaited<
        ReturnType<typeof appointmentsService.listMyAppointments>
      > | undefined) => previous,
    })),
  });

  return entries.reduce(
    (acc, [key], index) => {
      acc[key] = results[index]?.data?.meta.total ?? 0;
      return acc;
    },
    {} as Record<K, number>,
  );
}
