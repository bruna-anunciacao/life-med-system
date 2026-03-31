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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-semibold text-[#374151]">Nova senha</Label>
        <div className="relative">
          <Input
            placeholder="Insira a senha"
            type={isPasswordVisible ? "text" : "password"}
            className="pr-11"
            {...register("password")}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={isPasswordVisible ? "Esconder senha" : "Mostrar senha"}
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition-colors"
          >
            {isPasswordVisible ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs font-medium text-[#dc2626]">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-semibold text-[#374151]">Confirmar nova senha</Label>
        <div className="relative">
          <Input
            placeholder="Confirme a senha"
            type={isConfirmPasswordVisible ? "text" : "password"}
            className="pr-11"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={isConfirmPasswordVisible ? "Esconder senha" : "Mostrar senha"}
            onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition-colors"
          >
            {isConfirmPasswordVisible ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs font-medium text-[#dc2626]">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full mt-2" disabled={isLoading}>
        {isLoading ? <Spinner size="sm" /> : "Redefinir senha"}
      </Button>
    </form>
  );
}
