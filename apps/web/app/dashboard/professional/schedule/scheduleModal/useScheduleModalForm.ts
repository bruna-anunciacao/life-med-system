import * as z from "zod";
import {
  scheduleModalSchema,
  type ScheduleModalSchema,
} from "./scheduleModal.validation";
import { useProfessionalSettingsMutation } from "../../../../../queries/useProfessionalSettingsMutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

type ScheduleModalFormValues = z.input<typeof scheduleModalSchema>;

export function useScheduleModalForm(onSuccessCallback?: () => void) {
  const professionalSettingsMutation = useProfessionalSettingsMutation();

  const form = useForm<ScheduleModalFormValues>({
    resolver: zodResolver(scheduleModalSchema),
    defaultValues: {
      modality: "VIRTUAL",
      price: 0,
      payments: ["pix"],
      availability: [],
    },
  });

  const onSubmit: SubmitHandler<ScheduleModalFormValues> = (data) => {
    professionalSettingsMutation.mutate(data as ScheduleModalSchema, {
      onSuccess: () => {
        toast.success("Configurações da agenda atualizadas!");
        if (onSuccessCallback) {
          onSuccessCallback();
        }
      },
      onError: () => {
        toast.error("Erro ao salvar as configurações.");
      },
    });
  };

  return {
    form,
    onSubmit,
    isLoading: professionalSettingsMutation.isPending,
  };
}
