import { useQuery } from "@tanstack/react-query";
import { appointmentsService } from "../services/appointments-service";

export function useMyAppointmentsQuery(status?: string) {
  return useQuery({
    queryKey: ["my-appointments", status],
    queryFn: () => appointmentsService.listMyAppointments(status),
  });
}
