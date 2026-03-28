import * as z from "zod";

const passwordValidation = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .max(64, "A senha deve ter no máximo 64 caracteres")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/\d/, "A senha deve conter pelo menos um número")
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    "A senha deve conter pelo menos um caractere especial",
  );

const nameValidation = z
  .string()
  .min(2, "Nome deve ter no mínimo 2 caracteres")
  .max(100, "Nome deve ter no máximo 100 caracteres")
  .regex(
    /^[a-zA-ZÀ-ÿ\s'-]+$/,
    "Nome deve conter apenas letras, espaços, hífens e apóstrofos",
  );

const phoneValidation = z
  .string()
  .min(1, "Celular é obrigatório")
  .regex(
    /^\+[1-9]\d{6,14}$/,
    "Celular deve estar no formato internacional (ex: +5571999999999)",
  );

const cpfValidation = z
  .string()
  .min(1, "CPF é obrigatório")
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "Formato de CPF inválido");

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
    professionalLicense: z
      .string()
      .min(4, "Registro profissional deve ter no mínimo 4 caracteres")
      .max(20, "Registro profissional deve ter no máximo 20 caracteres"),
    specialty: z
      .string()
      .min(2, "Especialidade deve ter no mínimo 2 caracteres")
      .max(100, "Especialidade deve ter no máximo 100 caracteres"),
    subspecialty: z
      .string()
      .max(100, "Subespecialidade deve ter no máximo 100 caracteres")
      .optional(),
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
  subspecialty: string;
  modality: string;
  bio: string;
  specialty: string;
  socialLinks?: {
    referenceLink?: string;
    instagram?: string;
    other?: string;
  };
};
