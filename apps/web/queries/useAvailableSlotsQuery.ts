import { useQuery } from "@tanstack/react-query";
import { appointmentsService } from "../services/appointments-service";

export function useAvailableSlotsQuery(professionalId: string, date: string) {
  return useQuery({
    queryKey: ["available-slots", professionalId, date],
    queryFn: () => appointmentsService.getAvailableSlots(professionalId, date),
    enabled: !!professionalId && !!date,
  });
}
