import { useMutation } from '@tanstack/react-query';
import { authService, RegisterPatientDto } from '../services/auth-service';

export function useRegisterPatientMutation() {
  return useMutation({
    mutationFn: (data: RegisterPatientDto) => authService.registerPatient(data),
  });
}
