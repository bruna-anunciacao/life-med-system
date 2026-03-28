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

        <h1 className="text-2xl font-semibold">Conta Pendente de Aprovacao</h1>

        <p className="text-muted-foreground">
          Sua conta foi criada com sucesso, mas ainda precisa ser aprovada por um
          administrador. Voce recebera acesso assim que sua conta for verificada.
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
