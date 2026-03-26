import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  professionalService,
  UpdateSettingsPayload,
} from "../services/professional-service";

export function useProfessionalSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingsPayload) =>
      professionalService.updateSettings(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["professional-settings"] });
      void queryClient.invalidateQueries({ queryKey: ["daily-schedule"] });
    },
  });
}
