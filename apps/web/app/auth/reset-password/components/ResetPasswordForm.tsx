"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PasswordField } from "../../register/components/PasswordField";
import type { ResetPasswordSchema } from "../reset-password.validation";

type ResetPasswordFormProps = {
  form: UseFormReturn<ResetPasswordSchema>;
  isLoading: boolean;
  onSubmit: (data: ResetPasswordSchema) => void;
};

export function ResetPasswordForm({ form, isLoading, onSubmit }: ResetPasswordFormProps) {
  const { register, handleSubmit, formState: { errors }, control } = form;
  const password = useWatch({ control, name: "password", defaultValue: "" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <PasswordField
        name="password"
        label="Nova senha"
        register={register}
        errors={errors}
        showStrengthMeter
        currentValue={password}
      />

      <PasswordField
        name="confirmPassword"
        label="Confirmar nova senha"
        register={register}
        errors={errors}
      />

      <Button type="submit" size="lg" className="w-full mt-2" disabled={isLoading}>
        {isLoading ? <Spinner size="sm" /> : "Redefinir senha"}
      </Button>
    </form>
  );
}
