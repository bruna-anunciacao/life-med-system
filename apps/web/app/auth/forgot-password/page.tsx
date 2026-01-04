"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email });
    setSubmitted(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Recuperar senha</h1>
          <p className={styles.subtitle}>
            {submitted
              ? "Verifique seu e-mail"
              : "Digite seu e-mail para receber o link"}
          </p>
        </div>

        {submitted ? (
          <div className={styles.form}>
            <p style={{ textAlign: "center", color: "#334155" }}>
              Enviamos um link de recuperação para <strong>{email}</strong>.
              Verifique sua caixa de entrada e spam.
            </p>
            <Link
              href="/auth/login"
              className={styles.button}
              style={{ textAlign: "center", textDecoration: "none" }}
            >
              Voltar para o Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.button}>
              Enviar link
            </button>
          </form>
        )}
        {!submitted && (
          <div className={styles.footer}>
            Lembrou sua senha?
            <Link href="/auth/login" className={styles.link}>
              Voltar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}