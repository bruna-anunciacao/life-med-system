import * as z from "zod";
import { isValidPhoneBR } from "@/components/ui/phone-input-br";

export const patientProfileSchema = z.object({
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
  dateOfBirth: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
      },
      { message: "Data de nascimento não pode ser no futuro" },
    )
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        const ageDiff = Date.now() - date.getTime();
        const ageDate = new Date(ageDiff);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        return age <= 120;
      },
      { message: "Data de nascimento inválida" },
    ),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNDISCLOSED", "Masculino", "Feminino", "Outro", "Prefiro não informar", ""], {
    error: () => ({ message: "Selecione um gênero válido" }),
  }),
});

export type PatientProfileSchema = z.infer<typeof patientProfileSchema>;
