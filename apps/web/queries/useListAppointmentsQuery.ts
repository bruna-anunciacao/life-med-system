import { useQuery } from "@tanstack/react-query";
import { gestorService } from "../services/gestor-service";

export function useListAppointmentsQuery() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: () => gestorService.listAppointments(),
  });
}
