"use client";

import { CircleX } from "lucide-react";
import { authService } from "@/services/auth-service";

export default function PatientRejectedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <CircleX className="h-8 w-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-semibold">Cadastro não aprovado</h1>

        <p className="text-muted-foreground">
          Após análise, seu cadastro não foi aprovado para acesso ao sistema.
          Entre em contato com a equipe responsável caso precise de mais
          informações.
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
