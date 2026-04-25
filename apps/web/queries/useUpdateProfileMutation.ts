import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, UpdateProfileDto } from '../services/users-service';

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => usersService.updateProfile(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
