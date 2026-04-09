import { useMutation, useQueryClient } from "@tanstack/react-query";
import { specialitiesService } from "../services/specialities-service";
import { toast } from "sonner";

export const useUpdateSpeciality = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => specialitiesService.update(id, name),
        onSuccess: () => {
            toast.success("Especialidade atualizada!");
            queryClient.invalidateQueries({ queryKey: ["specialities"] });
        },
        onError: (error: Error) => toast.error(error.message),
    });
};