import { useQuery } from "@tanstack/react-query";
import { usersService } from "../services/users-service";

export function useAllProfessionalsQuery() {
  return useQuery({
    queryKey: ["admin-professionals"],
    queryFn: usersService.getAllProfessionals,
  });
}
