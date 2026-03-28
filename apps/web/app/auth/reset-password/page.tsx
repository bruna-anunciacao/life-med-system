"use client";

import Link from "next/link";
import styles from "../auth.module.css";
import { useResetPasswordForm } from "./useResetPasswordForm";
import { InvalidTokenCard } from "./components/InvalidTokenCard";
import { ResetPasswordForm } from "./components/ResetPasswordForm";

const ResetPasswordPage = () => {
  const { form, isLoading, token, onSubmit } = useResetPasswordForm();

  if (!token) return <InvalidTokenCard />;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Redefinir Senha</h1>
          <p className={styles.subtitle}>Crie uma nova senha para sua conta</p>
        </div>

        <ResetPasswordForm form={form} isLoading={isLoading} onSubmit={onSubmit} />

        <div className={styles.footer}>
          Lembrou sua senha?
          <Link href="/auth/login" className={styles.link}>Voltar</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
