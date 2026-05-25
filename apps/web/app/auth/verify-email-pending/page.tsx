"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResendVerificationMutation } from "../../../queries/useResendVerificationMutation";

export default function VerifyEmailPendingPage() {
  const [email, setEmail] = useState("");
  const resendMutation = useResendVerificationMutation();

  const handleResend = () => {
    if (!email) {
      toast.info("Informe seu e-mail para reenviar a confirmação.");
      return;
    }
    resendMutation.mutate(email, {
      onSuccess: () =>
        toast.success("E-mail de confirmação reenviado. Verifique sua caixa de entrada."),
      onError: (error) =>
        toast.error(
          error instanceof Error ? error.message : "Não foi possível reenviar o e-mail.",
        ),
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <MailCheck className="h-8 w-8 text-blue-600" />
        </div>

        <h1 className="text-2xl font-semibold">Confirme seu e-mail</h1>

        <p className="text-muted-foreground">
          Enviamos um link de confirmação para o seu e-mail. Confirme seu e-mail
          para continuar. Esta é a primeira etapa; depois sua conta será
          analisada por um administrador.
        </p>

        <div className="space-y-2 text-left">
          <Input
            type="email"
            placeholder="Reenviar para o e-mail..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="button"
            className="w-full"
            disabled={resendMutation.isPending}
            onClick={handleResend}
          >
            {resendMutation.isPending ? "Reenviando..." : "Reenviar e-mail de confirmação"}
          </Button>
        </div>

        <Link
          href="/auth/login"
          className="inline-block text-sm text-primary underline hover:no-underline"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
