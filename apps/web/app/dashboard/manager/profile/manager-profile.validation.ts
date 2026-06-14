import * as z from "zod";
import { isValidPhoneBR } from "@/components/ui/phone-input-br";

export const managerProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || isValidPhoneBR(val),
      "Telefone deve ter 10 ou 11 dígitos",
    ),
  bio: z
    .string()
    .max(500, "A bio deve ter no máximo 500 caracteres")
    .optional(),
});

export type ManagerProfileSchema = z.infer<typeof managerProfileSchema>;
