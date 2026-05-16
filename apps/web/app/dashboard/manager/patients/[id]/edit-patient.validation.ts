import * as z from "zod";
import { isValidPhoneBR } from "@/components/ui/phone-input-br";

export const editPatientSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome muito longo"),
  email: z.email("E-mail inválido"),
  cpf: z.string().optional().nullable().or(z.literal("")),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || isValidPhoneBR(val),
      "Telefone deve ter 10 ou 11 dígitos",
    ),
  dateOfBirth: z
    .string()
    .refine((val) => {
      if (!val) return true;
      return !Number.isNaN(new Date(val).getTime());
    }, "Data de nascimento inválida")
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      return date <= new Date();
    }, "Data de nascimento não pode ser no futuro")
    .optional()
    .or(z.literal("")),
  gender: z.enum(
    [
      "MALE",
      "FEMALE",
      "OTHER",
      "UNDISCLOSED",
      "Masculino",
      "Feminino",
      "Outro",
      "Prefiro não informar",
      "",
    ],
    {
      error: () => ({ message: "Selecione um gênero válido" }),
    },
  ),
});

export type EditPatientSchema = z.infer<typeof editPatientSchema>;
