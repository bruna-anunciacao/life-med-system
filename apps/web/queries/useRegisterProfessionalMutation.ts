import { useMutation } from '@tanstack/react-query';
import { authService, RegisterProfessionalDto } from '../services/auth-service';

export function useRegisterProfessionalMutation() {
  return useMutation({
    mutationFn: (data: RegisterProfessionalDto) => authService.registerProfessional(data),
  });
}
