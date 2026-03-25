import { useMutation } from '@tanstack/react-query';
import { authService, ForgotPasswordDto } from '../services/auth-service';

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (data: ForgotPasswordDto) => authService.forgotPassword(data),
  });
}
