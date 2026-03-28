import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../services/users-service";

export function useVerifyUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      emailVerified,
    }: {
      userId: string;
      emailVerified: boolean;
    }) => usersService.verifyUser(userId, emailVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
    },
  });
}
