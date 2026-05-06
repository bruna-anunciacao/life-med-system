import * as z from "zod";

export const patientProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  phone: z
    .string()
    .transform((val) => {
      if (!val) return "";
      let cleaned = val.replace(/[^\d+]/g, "");
      if (cleaned && !cleaned.startsWith("+")) {
        cleaned = `+55${cleaned}`;
      }
      return cleaned;
    })
    .refine((val) => val === "" || /^\+[1-9]\d{6,14}$/.test(val), {
      message:
        "Telefone deve estar no formato internacional (ex: +5571999999999)",
    })
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
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNDISCLOSED", "Masculino", "Feminino", "Outro", "Prefiro não informar", ""], {
    error: () => ({ message: "Selecione um gênero válido" }),
  }),
  address: z
    .string()
    .max(200, "Endereço deve ter no máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
});

export type PatientProfileSchema = z.infer<typeof patientProfileSchema>;
