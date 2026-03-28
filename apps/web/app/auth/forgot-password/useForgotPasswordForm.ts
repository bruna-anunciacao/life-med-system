"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "./forgot-password.validation";
import { authService } from "../../../services/auth-service";

export function useForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: data.email });
      toast.success(
        `Enviamos um link de recuperação para ${data.email}. Verifique sua caixa de entrada e spam.`,
      );
      form.reset();
      setSubmitted(true);
      setTimeout(() => router.push("/auth/login"), 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro desconhecido.");
    } finally {
      setIsLoading(false);
    }
  };

  return { form, isLoading, submitted, onSubmit };
}
