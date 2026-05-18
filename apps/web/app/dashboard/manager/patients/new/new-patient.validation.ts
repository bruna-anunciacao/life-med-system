import * as z from 'zod';
import { isValidPhoneBR } from '@/components/ui/phone-input-br';
import { addressSchema } from '@/components/address/address.validation';

export const newPatientSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  phone: z
    .string({ error: 'Telefone é obrigatório' })
    .min(1, 'Telefone é obrigatório')
    .refine(isValidPhoneBR, 'Telefone deve ter 10 ou 11 dígitos'),
  cpf: z.string().optional().or(z.literal('')),
  dateOfBirth: z
    .string()
    .refine((val) => {
      if (!val) return true;
      return !Number.isNaN(new Date(val).getTime());
    }, 'Data de nascimento inválida')
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      return date <= new Date();
    }, 'Data de nascimento não pode ser no futuro')
    .optional()
    .or(z.literal('')),
  gender: z.enum(['M', 'F', 'O', ''], {
    error: () => ({ message: 'Selecione um gênero válido' }),
  }).optional(),
  address: addressSchema,
});

export type NewPatientSchema = z.infer<typeof newPatientSchema>;
