import { useMutation } from '@tanstack/react-query';
import { authService, RegisterManagerDto } from '../services/auth-service';

export function useRegisterManagerMutation() {
  return useMutation({
    mutationFn: (data: RegisterManagerDto) => authService.registerManager(data),
  });
}
