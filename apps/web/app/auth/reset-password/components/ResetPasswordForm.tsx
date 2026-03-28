"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";
import type { ResetPasswordSchema } from "../reset-password.validation";
import styles from "../../auth.module.css";

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
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className="w-full flex flex-col gap-1">
        <Label className={styles.label}>Senha</Label>
        <div className="relative">
          <Input
            placeholder="Insira a senha"
            type={isPasswordVisible ? "text" : "password"}
            className={styles.input}
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
        <Label className={styles.label}>Confirmar a senha</Label>
        <div className="relative">
          <Input
            placeholder="Confirme a senha"
            type={isConfirmPasswordVisible ? "text" : "password"}
            className={styles.input}
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

      <Button type="submit" className={styles.button} disabled={isLoading}>
        {isLoading ? <Spinner size="sm" /> : "Redefinir senha"}
      </Button>
    </form>
  );
}
