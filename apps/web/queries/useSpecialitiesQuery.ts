import { useQuery } from "@tanstack/react-query";
import { specialitiesService } from "../services/specialities-service";

export const useSpecialitiesQuery = () => {
    return useQuery({
        queryKey: ["specialities"],
        queryFn: specialitiesService.getAll,
    });
};