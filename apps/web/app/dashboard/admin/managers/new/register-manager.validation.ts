import * as z from 'zod';
import { requiredCpfField } from '@/lib/cpf';
import { isValidPhoneBR } from '@/components/ui/phone-input-br';

export const registerManagerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  cpf: requiredCpfField(),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .refine(isValidPhoneBR, 'Telefone deve ter 10 ou 11 dígitos'),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional().or(z.literal('')),
});

export type RegisterManagerSchema = z.infer<typeof registerManagerSchema>;
