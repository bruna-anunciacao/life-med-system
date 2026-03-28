"use client";

import { useState } from "react";
import { type UseFormRegister, type FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import type { RegisterFormData } from "../register-validation";

type PasswordFieldName = "password" | "confirmPassword";

type PasswordFieldProps = {
  name: PasswordFieldName;
  label: string;
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
};

export function PasswordField({ name, label, register, errors }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const error = errors[name];

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
      {error && <p className="text-sm text-destructive">{error.message as string}</p>}
    </div>
  );
}
