import { useQuery } from "@tanstack/react-query";
import { managerService } from "../services/manager-service";

export function useListAppointmentsQuery() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: () => managerService.listAppointments(),
  });
}
