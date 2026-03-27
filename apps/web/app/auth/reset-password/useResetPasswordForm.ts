"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { resetPasswordSchema, type ResetPasswordSchema } from "./reset-password.validation";
import { authService } from "../../../services/auth-service";

export function useResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    if (!token) {
      toast.error("Token inválido ou expirado.");
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword({ token, newPassword: data.password });
      toast.success("Senha redefinida com sucesso!");
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro desconhecido.");
    } finally {
      setIsLoading(false);
    }
  };

  return { form, isLoading, token, onSubmit };
}
