"use client";

import Link from "next/link";
import { useResetPasswordForm } from "./useResetPasswordForm";
import { InvalidTokenCard } from "./components/InvalidTokenCard";
import { ResetPasswordForm } from "./components/ResetPasswordForm";
import { LifeMedLogo } from "../../ui/life-med-logo";

const ResetPasswordPage = () => {
  const { form, isLoading, token, onSubmit } = useResetPasswordForm();

  if (!token) return <InvalidTokenCard />;

  return (
    <div className="w-full max-w-96 sm:max-w-105 flex flex-col gap-5">
      {/* Header do form: logo + subtítulo */}
      <div className="flex flex-col">
        <Link href="/" className="w-fit mb-3">
          <LifeMedLogo width={160} className="h-auto" />
        </Link>
        <p className="text-sm text-[#6b7280]">
          Crie uma nova senha para sua conta
        </p>
      </div>

      {/* Formulário */}
      <ResetPasswordForm form={form} isLoading={isLoading} onSubmit={onSubmit} />

      <p className="text-sm text-[#6b7280]">
        Lembrou sua senha?{" "}
        <Link href="/auth/login" className="text-[#2563eb] font-semibold hover:underline">
          Voltar ao login
        </Link>
      </p>
    </div>
  );
};

export default ResetPasswordPage;
