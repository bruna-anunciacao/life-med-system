import { useQuery } from "@tanstack/react-query";
import {
  managerService,
  ManagerPatientResponse,
} from "../services/manager-service";

export function useGetPatientQuery(patientId: string) {
  return useQuery<ManagerPatientResponse>({
    queryKey: ["patient", patientId],
    queryFn: () => managerService.getPatient(patientId),
    enabled: !!patientId,
  });
}
