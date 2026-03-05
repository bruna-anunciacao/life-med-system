import { useQuery } from "@tanstack/react-query";
import { professionalService } from "../services/professional-service";

export function useDailyScheduleQuery(date: string) {
  return useQuery({
    queryKey: ["daily-schedule", date],
    queryFn: () => professionalService.getDailySchedule(date),
    enabled: Boolean(date),
  });
}
