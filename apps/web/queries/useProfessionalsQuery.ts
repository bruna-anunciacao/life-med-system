import { useQuery } from "@tanstack/react-query";
import { managerService } from "../services/manager-service";

export function useProfessionalsQuery() {
  return useQuery({
    queryKey: ["professionals"],
    queryFn: () => managerService.listProfessionals(),
  });
}
