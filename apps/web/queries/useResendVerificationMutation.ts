import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth-service';

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
  });
}
