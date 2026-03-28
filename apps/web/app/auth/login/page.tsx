"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";
import { useLoginForm } from "./useLoginForm";

const LoginPage = () => {
  const { form, isLoading, isPasswordVisible, setIsPasswordVisible, onSubmit } = useLoginForm();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="w-full px-4 py-8 flex items-start justify-center bg-[#f8fafc]">
      <div className="w-full max-w-[600px] p-10 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-[#e2e8f0] bg-white sm:p-6 sm:rounded-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-[#0f172a]">Bem-vindo de volta</h1>
          <p className="text-sm text-[#64748b]">Acesse sua conta para continuar</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="w-full flex flex-col gap-1">
            <Label htmlFor="email" className="text-sm font-medium text-[#334155]">
              E-mail
            </Label>
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

          <div className="w-full flex flex-col gap-1">
            <Label className="text-sm font-medium text-[#334155]">Senha</Label>
            <div className="relative">
              <Input
                placeholder="Insira a senha"
                type={isPasswordVisible ? "text" : "password"}
                className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
                {...register("password")}
              />
              <Button
                type="button"
                aria-label={isPasswordVisible ? "Esconder senha" : "Mostrar senha"}
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Link href="/auth/forgot-password" className="-mt-2 text-sm text-[#64748b] text-right no-underline hover:text-[#2563eb]">
            Esqueceu a senha?
          </Link>

          <Button
            type="submit"
            className="w-full mt-2 py-3 rounded-full border-none font-semibold text-white bg-gradient-to-br from-[#2563eb] to-[#0ea5e9] transition-transform hover:-translate-y-px hover:brightness-110 active:translate-y-0 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" /> : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[#64748b]">
          Não tem uma conta?
          <Link href="/auth/register" className="ml-1 no-underline font-medium text-[#2563eb] hover:underline">
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
