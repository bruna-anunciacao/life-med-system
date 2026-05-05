import { useQuery } from "@tanstack/react-query";
import { professionalService } from "../services/professional-service";

export function useDailyScheduleQuery(date: string, professionalId?: string) {
  return useQuery({
    queryKey: ["daily-schedule", date, professionalId],
    queryFn: () => professionalService.getDailySchedule(date, professionalId),
    enabled: Boolean(date),
  });
}
