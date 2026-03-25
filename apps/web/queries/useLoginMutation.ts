import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth-service';
import { LoginDto } from '../services/auth-service';

export function useLoginMutation() {
  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
  });
}
