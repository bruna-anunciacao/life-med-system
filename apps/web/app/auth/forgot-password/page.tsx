"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../auth.module.css";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { toast } from "sonner";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
} from "@heroui/react";
import { authService } from "../../../services/auth-service";

const formValidation = z.object({
  email: z.email("Email inválido"),
});

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
  });

  const resetForm = () => {
    setFormData({
      email: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setIsLoading(true);
    const result = formValidation.safeParse(formData);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName) {
          formattedErrors[String(fieldName)] = issue.message;
        }
      });
      return;
    }

    try {
      await authService.forgotPassword({
        email: formData.email,
      });

      toast.success(`Enviamos um link de recuperação para ${formData.email}. Verifique sua caixa de
              entrada e spam.`);
      resetForm();
      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro desconhecido.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Redefinir senha</h1>
          <p className={styles.subtitle}>
            {submitted
              ? "Verifique seu e-mail"
              : "Digite seu e-mail para receber o link"}
          </p>
        </div>

        {submitted ? (
          <div className={styles.form}>
            <p style={{ textAlign: "center", color: "#334155" }}>
              Enviamos um link de recuperação para. Verifique sua caixa de
              entrada e spam.
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
          <Form onSubmit={handleSubmit} className={styles.form}>
            <TextField isInvalid={!!errors.email} className="w-full">
              <Label htmlFor="email" className={styles.label}>
                E-mail
              </Label>
              <Input
                id="email"
                placeholder="exemplo@email.com"
                type="email"
                name="email"
                className={styles.input}
                value={formData.email}
                onChange={handleChange}
              />
              <FieldError>{errors.email}</FieldError>
            </TextField>
            <Button
              type="submit"
              className={styles.button}
              isDisabled={isLoading}
            >
              {isLoading ? <Spinner /> : "Enviar link"}
            </Button>
          </Form>
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
};

export default ForgotPasswordPage;
