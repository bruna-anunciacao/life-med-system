"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";
import type { ResetPasswordSchema } from "../reset-password.validation";

type ResetPasswordFormProps = {
  form: UseFormReturn<ResetPasswordSchema>;
  isLoading: boolean;
  onSubmit: (data: ResetPasswordSchema) => void;
};

export function ResetPasswordForm({ form, isLoading, onSubmit }: ResetPasswordFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="w-full flex flex-col gap-1">
        <Label className="text-sm font-medium text-[#334155]">Senha</Label>
        <div className="relative">
          <Input
            placeholder="Insira a senha"
            type={isPasswordVisible ? "text" : "password"}
            className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
            {...register("password")}
          />
          <Button
            type="button"
            aria-label={isPasswordVisible ? "Esconder senha" : "Mostrar senha"}
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="w-full flex flex-col gap-1">
        <Label className="text-sm font-medium text-[#334155]">Confirmar a senha</Label>
        <div className="relative">
          <Input
            placeholder="Confirme a senha"
            type={isConfirmPasswordVisible ? "text" : "password"}
            className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
            {...register("confirmPassword")}
          />
          <Button
            type="button"
            aria-label={isConfirmPasswordVisible ? "Esconder senha" : "Mostrar senha"}
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
          >
            {isConfirmPasswordVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </Button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full mt-2 py-3 rounded-full border-none font-semibold text-white bg-gradient-to-br from-[#2563eb] to-[#0ea5e9] transition-transform hover:-translate-y-px hover:brightness-110 active:translate-y-0 cursor-pointer" disabled={isLoading}>
        {isLoading ? <Spinner size="sm" /> : "Redefinir senha"}
      </Button>
    </form>
  );
}
