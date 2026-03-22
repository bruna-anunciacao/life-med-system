import { useQuery } from '@tanstack/react-query';
import { usersService } from '../services/users-service';

export function useUserQuery() {
  return useQuery({
    queryKey: ['user'],
    queryFn: usersService.getUser,
  });
}
