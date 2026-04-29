import { useQuery } from "@tanstack/react-query";
import { professionalService } from "../services/professional-service";

export function useProfessionalPatients() {
  return useQuery({
    queryKey: ["professional-patients"],
    queryFn: () => professionalService.getPatients(),
  });
}

export function usePatientDetail(patientId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["patient-detail", patientId],
    queryFn: () => professionalService.getPatientDetail(patientId),
    enabled,
  });
}
