import { useQuery } from "@tanstack/react-query";
import { professionalService } from "../services/professional-service";

export function useProfessionalSettingsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["professional-settings"],
    queryFn: () => professionalService.getSettings(),
    enabled: options?.enabled ?? true,
  });
}
