import Link from "next/link";
import { XCircle, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { useResendVerificationMutation } from "../../../../queries/useResendVerificationMutation";
import { toast } from "sonner";

interface VerifyEmailErrorProps {
  message: string;
}

export function VerifyEmailError({ message }: VerifyEmailErrorProps) {
  const [resendEmail, setResendEmail] = useState("");
  const resendMutation = useResendVerificationMutation();

  const handleResend = () => {
    if (!resendEmail) return;
    resendMutation.mutate(resendEmail, {
      onSuccess: () => toast.success("Se o e-mail estiver cadastrado, um novo link foi enviado."),
      onError: () => toast.error("Erro ao reenviar. Tente novamente."),
    });
  };

  return (
    <>
      <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
      <h1 className="text-xl font-bold text-[#0f172a] mb-2">Falha na verificação</h1>
      <p className="text-sm text-[#64748b] mb-6">{message}</p>

      <div className="mt-4 space-y-3">
        <p className="text-sm text-[#64748b]">Reenviar link de verificação:</p>
        <input
          type="email"
          placeholder="Seu e-mail"
          value={resendEmail}
          onChange={(e) => setResendEmail(e.target.value)}
          title="Insira o seu e-mail para receber um novo link de verificação"
          className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
        />
        <button
          onClick={handleResend}
          disabled={resendMutation.isPending || !resendEmail}
          title="Clique para reenviar o e-mail de verificação"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0f172a] text-white text-sm font-medium hover:bg-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Reenviar e-mail
        </button>
      </div>

      <Link 
        href="/auth/login" 
        className="mt-6 inline-block text-sm text-[#64748b] hover:underline"
        title="Voltar para a tela de login"
      >
        Voltar para o login
      </Link>
    </>
  );
}