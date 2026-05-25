"use client";

import { Clock } from "lucide-react";
import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>

        <h1 className="text-2xl font-semibold">Aguardando aprovação</h1>

        <p className="text-muted-foreground">
          Seu e-mail já foi confirmado. Agora sua conta precisa ser aprovada por
          um administrador antes do primeiro acesso. Você receberá um e-mail
          assim que a aprovação for concluída.
        </p>

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
