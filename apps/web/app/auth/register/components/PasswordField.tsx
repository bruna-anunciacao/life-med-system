"use client";

import { useState } from "react";
import { type UseFormRegister, type FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import zxcvbn from "zxcvbn";
import type { RegisterFormData } from "../register-validation";

type PasswordFieldName = "password" | "confirmPassword";

type PasswordFieldProps = {
  name: PasswordFieldName;
  label: string;
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  showStrengthMeter?: boolean;
  currentValue?: string;
};

export function PasswordField({
  name,
  label,
  register,
  errors,
  showStrengthMeter,
  currentValue,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const error = errors[name];

  const result = currentValue ? zxcvbn(currentValue) : null;
  const score = result ? result.score : 0;

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-blue-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return "Fraca";
      case 2:
        return "Razoável";
      case 3:
        return "Forte";
      case 4:
        return "Muito forte";
      default:
        return "";
    }
  };

  return (
    <div className="w-full flex flex-col gap-1">
      <Label className="text-sm font-medium text-[#334155]">{label}</Label>
      <div className="relative">
        <Input
          placeholder="Insira a senha"
          type={isVisible ? "text" : "password"}
          className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
          {...register(name)}
        />
        <Button
          type="button"
          aria-label={isVisible ? "Esconder senha" : "Mostrar senha"}
          size="sm"
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? (
            <Eye className="size-4" />
          ) : (
            <EyeOff className="size-4" />
          )}
        </Button>
      </div>

      {showStrengthMeter && currentValue && (
        <div className="mt-1 flex flex-col gap-1.5">
          <div className="flex gap-1.5 w-full">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
                  index < (score === 0 ? 1 : score)
                    ? getStrengthColor(score)
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <p
            className={`text-xs font-medium ${
              score <= 1
                ? "text-red-500"
                : score === 2
                  ? "text-yellow-600"
                  : score === 3
                    ? "text-blue-500"
                    : "text-green-500"
            }`}
          >
            {getStrengthLabel(score)}
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error.message as string}</p>
      )}
    </div>
  );
}
