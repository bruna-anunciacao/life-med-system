"use client";

import Link from "next/link";
import { useResetPasswordForm } from "./useResetPasswordForm";
import { InvalidTokenCard } from "./components/InvalidTokenCard";
import { ResetPasswordForm } from "./components/ResetPasswordForm";

const ResetPasswordPage = () => {
  const { form, isLoading, token, onSubmit } = useResetPasswordForm();

  if (!token) return <InvalidTokenCard />;

  return (
    <div className="w-full px-4 py-8 flex items-start justify-center bg-[#f8fafc]">
      <div className="w-full max-w-[600px] p-10 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-[#e2e8f0] bg-white sm:p-6 sm:rounded-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-[#0f172a]">Redefinir Senha</h1>
          <p className="text-sm text-[#64748b]">Crie uma nova senha para sua conta</p>
        </div>

        <ResetPasswordForm form={form} isLoading={isLoading} onSubmit={onSubmit} />

        <div className="mt-6 text-center text-sm text-[#64748b]">
          Lembrou sua senha?
          <Link href="/auth/login" className="ml-1 no-underline font-medium text-[#2563eb] hover:underline">Voltar</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
