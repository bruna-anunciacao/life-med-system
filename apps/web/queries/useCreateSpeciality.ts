import { useMutation, useQueryClient } from "@tanstack/react-query";
import { specialitiesService } from "../services/specialities-service";
import { toast } from "sonner";

export const useCreateSpeciality = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (name: string) => specialitiesService.create(name),
        onSuccess: () => {
            toast.success("Especialidade cadastrada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["specialities"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Erro ao cadastrar especialidade.");
        },
    });
};