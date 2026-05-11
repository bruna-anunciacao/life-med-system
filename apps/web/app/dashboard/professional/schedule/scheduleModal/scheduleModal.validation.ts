import * as z from "zod";

export const scheduleModalSchema = z
  .object({
    modality: z.enum(["VIRTUAL", "HOME_VISIT", "CLINIC"] as const, {
      error: () => ({ message: "Selecione uma modalidade válida" }),
    }),
    price: z.coerce
      .number("Insira um valor válido")
      .min(0, "O valor não pode ser negativo"),
    payments: z
      .array(z.string())
      .min(1, "Selecione pelo menos um método de pagamento"),
    availability: z
      .array(
        z.object({
          dayOfWeek: z.number({ error: () => ({ message: "Selecione um dia válido" }) }),
          start: z.string().min(1, "Informe o horário inicial"),
          end: z.string().min(1, "Informe o horário final"),
        })
      )
      .min(1, "Selecione pelo menos um dia de atendimento"),
  })

export type ScheduleModalSchema = z.infer<typeof scheduleModalSchema>;
