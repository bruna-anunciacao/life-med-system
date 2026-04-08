import { useQuery } from "@tanstack/react-query";
import { managerService } from "../services/manager-service";

export function useListPatientsQuery() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: () => managerService.listPatients(),
  });
}
