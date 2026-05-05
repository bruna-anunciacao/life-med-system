import * as z from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z.email("Email inválido"),
  professionalLicense: z
    .string()
    .min(1, "Registro profissional é obrigatório")
    .max(20, "Registro profissional deve ter no máximo 20 caracteres"),
  primarySpecialty: z.string().min(1, "A especialidade principal é obrigatória"),
  secondarySpecialty: z.string().optional(),
  modality: z.enum(["VIRTUAL", "HOME_VISIT", "CLINIC"], {
    error: () => ({ message: "Selecione uma modalidade válida" }),
  }),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  socialLinks: z.object({
    referenceLink: z.string().optional(),
    instagram: z.string().optional(),
    other: z.string().optional(),
  }),
});

export type ProfileSchema = z.infer<typeof profileSchema>;
