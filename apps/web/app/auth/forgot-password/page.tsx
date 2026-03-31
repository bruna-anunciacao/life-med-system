"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useForgotPasswordForm } from "./useForgotPasswordForm";
import Logo from "../../life-med-logo.png";

const ForgotPasswordPage = () => {
  const { form, isLoading, submitted, onSubmit } = useForgotPasswordForm();
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <div className="w-full max-w-96 sm:max-w-105 flex flex-col gap-5">
      {/* Header do form: logo + subtítulo */}
      <div className="flex flex-col">
        <Link href="/" className="w-fit mb-3">
          <Image src={Logo} alt="Life Med" width={160} className="h-auto" />
        </Link>
        <p className="text-sm text-[#6b7280]">
          {submitted ? "Verifique seu e-mail" : (
            <>
              Lembrou a senha?{" "}
              <Link href="/auth/login" className="text-[#2563eb] font-semibold hover:underline">
                Voltar ao login
              </Link>
            </>
          )}
        </p>
      </div>

      {submitted ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[#374151] leading-relaxed">
            Enviamos um link de recuperação para o seu e-mail. Verifique sua caixa de entrada e spam.
          </p>
          <Link href="/auth/login">
            <Button size="lg" className="w-full">Voltar ao login</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="forgot-email" className="text-sm font-semibold text-[#374151]">E-mail</Label>
            <Input
              id="forgot-email"
              placeholder="seu@email.com"
              type="email"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-medium text-[#dc2626]">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : "Enviar link"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
