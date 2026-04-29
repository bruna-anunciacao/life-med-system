import * as z from "zod";

export const patientProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      "Nome deve conter apenas letras, espaços, hífens e apóstrofos",
    ),
  phone: z
    .string()
    .regex(
      /^\+[1-9]\d{6,14}$/,
      "Telefone deve estar no formato internacional (ex: +5571999999999)",
    )
    .or(z.literal("")),
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
  gender: z.enum(["MALE", "FEMALE", "OTHER", "Masculino", "Feminino", "Outro", "Prefiro não informar", ""], {
    error: () => ({ message: "Selecione um gênero válido" }),
  }),
});

export type PatientProfileSchema = z.infer<typeof patientProfileSchema>;
