import * as z from 'zod';

export const registerManagerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(64, 'Senha deve ter no máximo 64 caracteres')
    .regex(/(?=.*[a-z])/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/(?=.*[A-Z])/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/(?=.*\d)/, 'Senha deve conter pelo menos um número')
    .regex(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 'Senha deve conter pelo menos um caractere especial'),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, 'Telefone deve estar no formato internacional (ex: +5571999999999)'),
  address: z.string().max(200, 'Endereço deve ter no máximo 200 caracteres').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional().or(z.literal('')),
});

export type RegisterManagerSchema = z.infer<typeof registerManagerSchema>;
