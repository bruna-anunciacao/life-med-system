import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin-service";

export function useVerifyUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      emailVerified,
    }: {
      userId: string;
      emailVerified: boolean;
    }) => adminService.verifyUser(userId, emailVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
    },
  });
}
