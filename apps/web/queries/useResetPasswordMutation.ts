import { useMutation } from '@tanstack/react-query';
import { authService, ResetPasswordDto } from '../services/auth-service';

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (data: ResetPasswordDto) => authService.resetPassword(data),
  });
}
