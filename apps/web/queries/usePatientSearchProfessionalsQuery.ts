import { useQuery } from "@tanstack/react-query";
import {
  professionalsService,
  ListProfessionalsParams,
} from "@/services/professionals-service";

export function usePatientSearchProfessionalsQuery(
  params: ListProfessionalsParams,
) {
  return useQuery({
    queryKey: ["patient-search-professionals", params],
    queryFn: () => professionalsService.list(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useProfessionalLocationsQuery() {
  return useQuery({
    queryKey: ["professional-locations"],
    queryFn: () => professionalsService.listLocations(),
    staleTime: 5 * 60 * 1000,
  });
}
