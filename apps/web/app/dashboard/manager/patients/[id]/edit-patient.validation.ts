import * as z from "zod";

export const editPatientSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome muito longo"),
  email: z.email("E-mail inválido"),
  cpf: z.string().optional().nullable().or(z.literal("")),
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
