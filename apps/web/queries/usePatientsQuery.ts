import { useQuery } from '@tanstack/react-query';
import { usersService } from '../services/users-service';

export function usePatientsQuery() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: usersService.getAllPatients,
  });
}
