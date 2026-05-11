import { useQuery } from "@tanstack/react-query";
import { locationsService } from "../services/locations-service";

export function useLocationsQuery() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: () => locationsService.getCities(),
  });
}
