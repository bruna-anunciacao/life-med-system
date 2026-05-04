import * as z from "zod";

export const scheduleModalSchema = z
  .object({
    modality: z.enum(["VIRTUAL", "HOME_VISIT", "CLINIC"] as const),
    price: z.coerce
      .number("Insira um valor válido")
      .min(0, "O valor não pode ser negativo"),
    payments: z
      .array(z.string())
      .min(1, "Selecione pelo menos um método de pagamento"),
    availability: z
      .array(
        z.object({
          dayOfWeek: z.number(),
          start: z.string(),
          end: z.string(),
        })
      )
      .min(1, "Selecione pelo menos um dia de atendimento"),
  })

export type ScheduleModalSchema = z.infer<typeof scheduleModalSchema>;
