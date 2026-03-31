import Link from "next/link";
import { CheckCircle } from "lucide-react";

interface VerifyEmailSuccessProps {
  message: string;
}

export function VerifyEmailSuccess({ message }: VerifyEmailSuccessProps) {
  return (
    <>
      <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
      <h1 className="text-xl font-bold text-[#0f172a] mb-2">E-mail verificado!</h1>
      <p className="text-sm text-[#64748b] mb-6">{message}</p>
      <p className="text-xs text-[#94a3b8]">Redirecionando para o login...</p>
      <Link href="/auth/login" className="mt-4 inline-block text-sm font-medium text-[#2563eb] hover:underline">
        Ir para o login agora
      </Link>
    </>
  );
}
