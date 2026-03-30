import { useQuery } from "@tanstack/react-query";
import { gestorService } from "../services/gestor-service";

export function useListPatientsQuery() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: () => gestorService.listPatients(),
  });
}
