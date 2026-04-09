import { useMutation, useQueryClient } from "@tanstack/react-query";
import { specialitiesService } from "../services/specialities-service";
import { toast } from "sonner";

export const useDeleteSpeciality = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => specialitiesService.delete(id),
        onSuccess: () => {
            toast.success("Especialidade removida!");
            queryClient.invalidateQueries({ queryKey: ["specialities"] });
        },
        onError: (error: Error) => toast.error(error.message),
    });
};