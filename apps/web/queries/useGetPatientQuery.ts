import { useQuery } from "@tanstack/react-query";
import { gestorService } from "../services/gestor-service";

export function useGetPatientQuery(patientId: string) {
  return useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => gestorService.getPatient(patientId),
    enabled: !!patientId,
  });
}
