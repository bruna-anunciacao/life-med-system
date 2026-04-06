import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth-service';

export function useVerifyEmailQuery(token: string | null) {
  return useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => authService.verifyEmail(token!),
    enabled: !!token,
    retry: false,
  });
}
