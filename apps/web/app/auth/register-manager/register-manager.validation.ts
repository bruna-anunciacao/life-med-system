import * as z from 'zod';
import { passwordValidation } from '@/lib/password';
import { requiredCpfField } from '@/lib/cpf';

export const registerManagerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  cpf: requiredCpfField(),
  password: passwordValidation,
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\+[1-9]\d{6,14}$/, 'Telefone deve estar no formato internacional (ex: +5571999999999)'),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional().or(z.literal('')),
});

export type RegisterManagerSchema = z.infer<typeof registerManagerSchema>;
