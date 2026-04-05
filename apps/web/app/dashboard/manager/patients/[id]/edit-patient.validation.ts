import * as z from 'zod';

export const editPatientSchema = z.object({
  phone: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, 'Telefone deve estar no formato internacional (ex: +5571999999999)')
    .optional()
    .or(z.literal('')),
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

export type EditPatientSchema = z.infer<typeof editPatientSchema>;
