import * as z from "zod";

export const formatCpf = (cpf: string) => {
  const digits = cpf.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.replace(/(\d{3})(\d+)/, "$1.$2");
  if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2}).*/, "$1.$2.$3-$4");
};

export const applyCpfMask = (value: string) => formatCpf(value);

export const onlyCpfDigits = (value: string) => value.replace(/\D/g, "");

const computeCpfCheckDigit = (digits: string, factor: number) => {
  let sum = 0;
  for (let i = 0; i < factor - 1; i++) {
    sum += Number(digits[i]) * (factor - i);
  }
  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
};

export const isValidCpf = (value: string | null | undefined): boolean => {
  if (!value) return false;
  const digits = onlyCpfDigits(value);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const firstCheck = computeCpfCheckDigit(digits, 10);
  if (firstCheck !== Number(digits[9])) return false;

  const secondCheck = computeCpfCheckDigit(digits, 11);
  return secondCheck === Number(digits[10]);
};

export const CPF_REQUIRED_MESSAGE = "CPF é obrigatório";
export const CPF_INVALID_MESSAGE = "CPF inválido";

export const requiredCpfField = () =>
  z
    .string()
    .min(1, CPF_REQUIRED_MESSAGE)
    .refine((val) => isValidCpf(val), { message: CPF_INVALID_MESSAGE });

export const optionalCpfField = () =>
  z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || isValidCpf(val), { message: CPF_INVALID_MESSAGE });
