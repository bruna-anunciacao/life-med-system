import { useMutation } from '@tanstack/react-query';
import { authService, RegisterGestorDto } from '../services/auth-service';

export function useRegisterGestorMutation() {
  return useMutation({
    mutationFn: (data: RegisterGestorDto) => authService.registerGestor(data),
  });
}
