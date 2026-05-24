import * as z from "zod";

export const passwordValidation = z
  .string()
  .min(6, "A senha deve ter no mínimo 6 caracteres");
