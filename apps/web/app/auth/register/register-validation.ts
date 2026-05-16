import * as z from "zod";
import { passwordValidation } from "@/lib/password";
import { isValidPhoneBR } from "@/components/ui/phone-input-br";

const nameValidation = z
  .string()
  .min(2, "Nome deve ter no mínimo 2 caracteres")
  .max(100, "Nome deve ter no máximo 100 caracteres");

const phoneValidation = z
  .string()
  .min(1, "Celular é obrigatório")
  .refine(isValidPhoneBR, "Celular deve ter 10 ou 11 dígitos");

const cpfValidation = z
  .string()
  .min(1, "CPF é obrigatório")
  .refine(
    (val) => {
      // Aceita 11 dígitos (somente números) ou 14 caracteres (com máscara)
      const onlyDigits = val.replace(/\D/g, "");
      return (
        onlyDigits.length === 11 || val.length === 14 // 000.000.000-00
      );
    },
    { message: "CPF deve ter 11 dígitos ou estar no formato 000.000.000-00" },
  );

export const registerPatientValidation = z
  .object({
    name: nameValidation,
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    cpf: cpfValidation,
    phone: phoneValidation,
    dateOfBirth: z
      .union([z.string(), z.date(), z.null()])
      .transform((val) => (val ? new Date(val) : null))
      .refine((val) => val !== null, {
        message: "Data de nascimento é obrigatória",
      })
      .refine(
        (val) => {
          if (!val) return false;
          return val <= new Date();
        },
        { message: "Data de nascimento não pode ser no futuro" },
      )
      .refine(
        (val) => {
          if (!val) return false;
          const ageDiff = Date.now() - val.getTime();
          const ageDate = new Date(ageDiff);
          const age = Math.abs(ageDate.getUTCFullYear() - 1970);
          return age <= 120;
        },
        { message: "Data de nascimento inválida" },
      ),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "UNDISCLOSED"], {
      error: () => ({ message: "Selecione um gênero válido" }),
    }),
    password: passwordValidation,
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
    role: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const registerProfessionalValidation = z
  .object({
    name: nameValidation,
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    password: passwordValidation,
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
    role: z.string(),
    cpf: cpfValidation,
    professionalLicense: z
      .string()
      .min(4, "Registro profissional deve ter no mínimo 4 caracteres")
      .max(20, "Registro profissional deve ter no máximo 20 caracteres"),
    primarySpecialty: z.string().min(1, "A especialidade principal é obrigatória"),
    secondarySpecialty: z.string().optional(),
    modality: z.enum(["VIRTUAL", "HOME_VISIT", "CLINIC"], {
      error: () => ({ message: "Selecione uma modalidade válida" }),
    }),
    socialLinks: z.object({
      referenceLink: z.string().optional(),
      instagram: z.string().optional(),
      other: z.string().optional(),
    }),
    bio: z
      .string()
      .max(500, "Biografia deve ter no máximo 500 caracteres")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  cpf: string;
  professionalLicense: string;
  phone: string;
  dateOfBirth: Date | null;
  gender: string;
  modality: string;
  bio: string;
  primarySpecialty: string;
  secondarySpecialty: string;
  socialLinks?: {
    referenceLink?: string;
    instagram?: string;
    other?: string;
  };
};
