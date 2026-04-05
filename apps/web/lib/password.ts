import * as z from "zod";
import zxcvbn from "zxcvbn";

export const passwordValidation = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .refine((password) => {
    const result = zxcvbn(password);
    return result.score >= 3;
  }, "Sua senha é muito fraca. Tente misturar letras, números e símbolos especiais.");
