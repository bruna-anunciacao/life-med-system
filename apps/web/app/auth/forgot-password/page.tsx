"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useForgotPasswordForm } from "./useForgotPasswordForm";

const ForgotPasswordPage = () => {
  const { form, isLoading, submitted, onSubmit } = useForgotPasswordForm();
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <div className="w-full px-4 py-8 flex items-start justify-center bg-[#f8fafc]">
      <div className="w-full max-w-[600px] p-10 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-[#e2e8f0] bg-white sm:p-6 sm:rounded-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-[#0f172a]">Redefinir senha</h1>
          <p className="text-sm text-[#64748b]">
            {submitted ? "Verifique seu e-mail" : "Digite seu e-mail para receber o link"}
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col gap-4">
            <p style={{ textAlign: "center", color: "#334155" }}>
              Enviamos um link de recuperação para o seu e-mail. Verifique sua caixa de entrada e spam.
            </p>
            <Link href="/auth/login" className="w-full mt-2 py-3 rounded-full border-none font-semibold text-white bg-gradient-to-br from-[#2563eb] to-[#0ea5e9] transition-transform hover:-translate-y-px hover:brightness-110 active:translate-y-0 cursor-pointer inline-flex items-center justify-center" style={{ textAlign: "center", textDecoration: "none" }}>
              Voltar para o Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="w-full flex flex-col gap-1">
              <Label htmlFor="email" className="text-sm font-medium text-[#334155]">E-mail</Label>
              <Input
                id="email"
                placeholder="exemplo@email.com"
                type="email"
                className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-2 py-3 rounded-full border-none font-semibold text-white bg-gradient-to-br from-[#2563eb] to-[#0ea5e9] transition-transform hover:-translate-y-px hover:brightness-110 active:translate-y-0 cursor-pointer" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : "Enviar link"}
            </Button>
          </form>
        )}

        {!submitted && (
          <div className="mt-6 text-center text-sm text-[#64748b]">
            Lembrou sua senha?
            <Link href="/auth/login" className="ml-1 no-underline font-medium text-[#2563eb] hover:underline">Voltar</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
