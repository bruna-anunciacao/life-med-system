import { useQuery } from "@tanstack/react-query";
import { appointmentsService } from "../services/appointments-service";

export function useMyAppointmentsQuery(params?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => appointmentsService.listMyAppointments(params),
  });
}
