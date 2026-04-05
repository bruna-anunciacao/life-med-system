import * as z from 'zod';

export const newPatientSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, 'Telefone deve estar no formato internacional (ex: +5571999999999)'),
  cpf: z.string().optional().or(z.literal('')),
  dateOfBirth: z
    .string()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      return !isNaN(date.getTime()) && date <= new Date();
    }, 'Data de nascimento não pode ser no futuro')
    .optional()
    .or(z.literal('')),
  gender: z.enum(['M', 'F', 'O', '']).optional(),
  address: z.string().max(200, 'Endereço deve ter no máximo 200 caracteres').optional().or(z.literal('')),
});

export type NewPatientSchema = z.infer<typeof newPatientSchema>;
