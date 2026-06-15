"use client";

import { Clock } from "lucide-react";
import { authService } from "@/services/auth-service";

export default function PatientPendingApprovalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>

        <h1 className="text-2xl font-semibold">Cadastro em análise</h1>

        <p className="text-muted-foreground">
          Seu questionário foi enviado e seu cadastro será analisado pela equipe
          responsável antes da liberação do acesso ao painel.
        </p>

        <button
          type="button"
          onClick={() => authService.logout()}
          className="text-sm text-primary underline hover:no-underline"
        >
          Sair e voltar para o login
        </button>
      </div>
    </div>
  );
}
