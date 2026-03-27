"use client";
import Link from "next/link";
import styles from "../auth.module.css";
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
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Bem-vindo de volta</h1>
          <p className={styles.subtitle}>Acesse sua conta para continuar</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className="w-full flex flex-col gap-1">
            <Label htmlFor="email" className={styles.label}>
              E-mail
            </Label>
            <Input
              id="email"
              placeholder="exemplo@email.com"
              type="email"
              className={styles.input}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="w-full flex flex-col gap-1">
            <Label className={styles.label}>Senha</Label>
            <div className="relative">
              <Input
                placeholder="Insira a senha"
                type={isPasswordVisible ? "text" : "password"}
                className={styles.input}
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

          <Link href="/auth/forgot-password" className={styles.forgotLink}>
            Esqueceu a senha?
          </Link>

          <Button
            type="submit"
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" /> : "Entrar"}
          </Button>
        </form>

        <div className={styles.footer}>
          Não tem uma conta?
          <Link href="/auth/register" className={styles.link}>
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
