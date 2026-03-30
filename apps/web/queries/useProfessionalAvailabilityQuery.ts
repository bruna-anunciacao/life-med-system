import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ProfessionalAvailability {
  professional: {
    id: string;
    name: string;
    email: string;
    specialty?: string;
  };
  availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}

export function useProfessionalAvailabilityQuery(professionalId: string | null) {
  return useQuery<ProfessionalAvailability>({
    queryKey: ['professional-availability', professionalId],
    queryFn: async () => {
      if (!professionalId) {
        throw new Error('Professional ID is required');
      }
      const response = await api.get(
        `/gestor/professionals/${professionalId}/availability`
      );
      return response.data;
    },
    enabled: !!professionalId,
  });
}
