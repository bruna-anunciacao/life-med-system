import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/admin-service";

export function usePatientsQuery() {
  return useQuery({
    queryKey: ["admin-users", { role: "PATIENT" }],
    queryFn: () => adminService.listUsers({ role: "PATIENT" }),
  });
}
