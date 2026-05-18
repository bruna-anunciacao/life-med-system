import * as z from "zod";
import { isValidPhoneBR } from "@/components/ui/phone-input-br";

export const patientFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  status: z.string().min(1, "Status é obrigatório"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || isValidPhoneBR(val),
      "Telefone deve ter 10 ou 11 dígitos",
    ),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  cpf: z.string().optional(),
});

export const professionalFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  status: z.string().min(1, "Status é obrigatório"),
  professionalLicense: z.string().optional(),
  primarySpecialtyId: z.string().optional(),
  secondarySpecialtyId: z.string().optional(),
  modality: z.string().optional(),
  bio: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
});

export type PatientFormSchema = z.infer<typeof patientFormSchema>;
export type ProfessionalFormSchema = z.infer<typeof professionalFormSchema>;
