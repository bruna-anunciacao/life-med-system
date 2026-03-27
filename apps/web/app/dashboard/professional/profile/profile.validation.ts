import * as z from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome deve conter apenas letras, espaços, hífens e apóstrofos"),
  email: z.email("Email inválido"),
  professionalLicense: z
    .string()
    .min(1, "Registro profissional é obrigatório")
    .max(20, "Registro profissional deve ter no máximo 20 caracteres"),
  specialty: z
    .string()
    .min(2, "Especialidade deve ter no mínimo 2 caracteres")
    .max(100, "Especialidade deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Especialidade deve conter apenas letras, espaços, hífens e apóstrofos"),
  subspecialty: z.string().optional(),
  modality: z.enum(["VIRTUAL", "HOME_VISIT", "CLINIC"]),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  socialLinks: z.object({
    referenceLink: z.string().optional(),
    instagram: z.string().optional(),
    other: z.string().optional(),
  }),
});

export type ProfileSchema = z.infer<typeof profileSchema>;
