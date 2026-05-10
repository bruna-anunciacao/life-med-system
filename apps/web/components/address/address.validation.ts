import * as z from "zod";

export const addressSchema = z.object({
  zipCode: z
    .string()
    .length(8, "CEP deve ter exatamente 8 dígitos")
    .regex(/^\d+$/, "CEP deve conter apenas números"),

  street: z
    .string()
    .min(3, "Rua deve ter no mínimo 3 caracteres")
    .max(100, "Rua deve ter no máximo 100 caracteres"),

  number: z
    .string()
    .min(1, "Número é obrigatório")
    .max(20, "Número deve ter no máximo 20 caracteres"),

  complement: z
    .string()
    .max(100, "Complemento deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal("")),

  district: z
    .string()
    .min(2, "Bairro deve ter no mínimo 2 caracteres")
    .max(50, "Bairro deve ter no máximo 50 caracteres"),

  city: z
    .string()
    .min(2, "Cidade deve ter no mínimo 2 caracteres")
    .max(50, "Cidade deve ter no máximo 50 caracteres"),

  state: z
    .string()
    .length(2, "Estado deve ter 2 caracteres")
    .toUpperCase(),
});

export type AddressSchema = z.infer<typeof addressSchema>;
