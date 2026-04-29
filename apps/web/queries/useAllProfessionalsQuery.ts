import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/admin-service";

export function useAllProfessionalsQuery() {
  return useQuery({
    queryKey: ["admin-professionals"],
    queryFn: adminService.listProfessionals,
  });
}
