import { useQuery } from "@tanstack/react-query";
import { managerService } from "../services/manager-service";

export function useGetPatientQuery(patientId: string) {
  return useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => managerService.getPatient(patientId),
    enabled: !!patientId,
  });
}
