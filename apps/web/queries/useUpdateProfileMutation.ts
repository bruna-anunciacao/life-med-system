import { useMutation } from '@tanstack/react-query';
import { usersService, UpdateProfileDto } from '../services/users-service';

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: (data: UpdateProfileDto) => usersService.updateProfile(data),
  });
}
