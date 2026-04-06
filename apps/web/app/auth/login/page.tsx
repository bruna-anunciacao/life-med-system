"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";
import { useLoginForm } from "./useLoginForm";
import { LifeMedLogo } from "../../ui/life-med-logo";

const LoginPage = () => {
  const { form, isLoading, isPasswordVisible, setIsPasswordVisible, onSubmit } = useLoginForm();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="w-full max-w-96 sm:max-w-105 flex flex-col gap-5">
      {/* Header do form: logo + subtítulo */}
      <div className="flex flex-col">
        <Link href="/" className="w-fit mb-3">
          <LifeMedLogo width={160} className="h-auto" />
        </Link>
        <p className="text-sm text-[#6b7280]">
          Não tem conta?{" "}
          <Link href="/auth/register" className="text-[#2563eb] font-semibold hover:underline">
            Criar conta
          </Link>
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email" className="text-sm font-semibold text-[#374151]">
            E-mail
          </Label>
          <Input
            id="login-email"
            placeholder="seu@email.com"
            type="email"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs font-medium text-[#dc2626]">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" className="text-sm font-semibold text-[#374151]">
              Senha
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm font-semibold text-[#2563eb] hover:underline"
            >
              Esqueci a senha
            </Link>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              placeholder="••••••••"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="current-password"
              className="pr-11"
              {...register("password")}
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition-colors"
            >
              {isPasswordVisible ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-[#dc2626]">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : "Entrar"}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
