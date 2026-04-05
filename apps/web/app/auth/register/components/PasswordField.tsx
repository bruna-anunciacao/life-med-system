"use client";

import { useState } from "react";
import { type UseFormRegister, type FieldErrors, type FieldValues, type Path } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import zxcvbn from "zxcvbn";

type PasswordFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  showStrengthMeter?: boolean;
  currentValue?: string;
};

const STRENGTH_CONFIG = [
  { label: "Fraca", color: "bg-red-500", textColor: "text-red-500" },
  { label: "Fraca", color: "bg-red-500", textColor: "text-red-500" },
  { label: "Razoável", color: "bg-yellow-500", textColor: "text-yellow-600" },
  { label: "Forte", color: "bg-blue-500", textColor: "text-blue-500" },
  { label: "Muito forte", color: "bg-green-500", textColor: "text-green-500" },
];

export function PasswordField<T extends FieldValues>({
  name,
  label,
  register,
  errors,
  showStrengthMeter,
  currentValue,
}: PasswordFieldProps<T>) {
  const [isVisible, setIsVisible] = useState(false);

  const error = errors[name];
  const score = currentValue ? zxcvbn(currentValue).score : 0;
  const strength = STRENGTH_CONFIG[score] ?? STRENGTH_CONFIG[0];

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
          {isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </Button>
      </div>

      {showStrengthMeter && currentValue && (
        <div className="mt-1 flex flex-col gap-1.5">
          <div className="flex gap-1.5 w-full">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
                  index < (score === 0 ? 1 : score) ? strength.color : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <p className={`text-xs font-medium ${strength.textColor}`}>
            {strength.label}
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error.message as string}</p>
      )}
    </div>
  );
}
