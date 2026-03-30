import { useQuery } from "@tanstack/react-query";
import { gestorService } from "../services/gestor-service";

export function useProfessionalsQuery() {
  return useQuery({
    queryKey: ["professionals"],
    queryFn: () => gestorService.listProfessionals(),
  });
}
