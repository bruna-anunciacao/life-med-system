import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin-service';

export function usePatientsQuery() {
  return useQuery({
    queryKey: ['admin-patients'],
    queryFn: adminService.listPatients,
  });
}
