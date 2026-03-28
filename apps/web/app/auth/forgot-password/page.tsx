"use client";

import Link from "next/link";
import styles from "../auth.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useForgotPasswordForm } from "./useForgotPasswordForm";

const ForgotPasswordPage = () => {
  const { form, isLoading, submitted, onSubmit } = useForgotPasswordForm();
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Redefinir senha</h1>
          <p className={styles.subtitle}>
            {submitted ? "Verifique seu e-mail" : "Digite seu e-mail para receber o link"}
          </p>
        </div>

        {submitted ? (
          <div className={styles.form}>
            <p style={{ textAlign: "center", color: "#334155" }}>
              Enviamos um link de recuperação para o seu e-mail. Verifique sua caixa de entrada e spam.
            </p>
            <Link href="/auth/login" className={styles.button} style={{ textAlign: "center", textDecoration: "none" }}>
              Voltar para o Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className="w-full flex flex-col gap-1">
              <Label htmlFor="email" className={styles.label}>E-mail</Label>
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

            <Button type="submit" className={styles.button} disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : "Enviar link"}
            </Button>
          </form>
        )}

        {!submitted && (
          <div className={styles.footer}>
            Lembrou sua senha?
            <Link href="/auth/login" className={styles.link}>Voltar</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
