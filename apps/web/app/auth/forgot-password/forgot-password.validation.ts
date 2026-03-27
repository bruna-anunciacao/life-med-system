import * as z from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
