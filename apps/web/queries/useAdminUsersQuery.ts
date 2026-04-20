import { useQuery } from "@tanstack/react-query";
import { adminService, AdminUsersParams } from "../services/admin-service";

export function useAdminUsersQuery(params?: AdminUsersParams) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => adminService.listUsers(params),
  });
}
