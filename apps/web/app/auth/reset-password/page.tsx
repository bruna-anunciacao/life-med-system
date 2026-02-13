"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../auth.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import * as z from "zod";
import { toast } from "sonner";
import {
  Button,
  FieldError,
  Form,
  InputGroup,
  Label,
  Spinner,
  TextField,
} from "@heroui/react";
import { Eye, EyeSlash } from "@gravity-ui/icons";
import { authService } from "../../../services/auth-service";

const formValidation = z
  .object({
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "A senha deve ter no mínimo 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

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

    setErrors({});

    if (!token) {
      toast.error("Token inválido ou expirado.");
      return;
    }

    const result = formValidation.safeParse(formData);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    try {
      await authService.resetPassword({
        token: token,
        newPassword: formData.password,
      });

      toast.success("Senha redefinida com sucesso!");

      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro desconhecido.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.cardNoToken}>
          <div className={styles.noToken}>
            Link inválido. Por favor, solicite a recuperação novamente.
          </div>
          <Link href="/auth/forgot-password" className={styles.button}>
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Redefinir Senha</h1>
          <p className={styles.subtitle}>Crie uma nova senha para sua conta</p>
        </div>
        <Form onSubmit={handleSubmit} className={styles.form}>
          <TextField isInvalid={!!errors.password} className="w-full">
            <Label className={styles.label}>Senha</Label>
            <InputGroup fullWidth className={styles.input}>
              <InputGroup.Input
                name="password"
                placeholder="Insira a senha"
                type={isPasswordVisible ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
              />
              <InputGroup.Suffix className="pr-0">
                <Button
                  isIconOnly
                  aria-label={
                    isPasswordVisible ? "Esconder senha" : "Mostrar senha"
                  }
                  size="sm"
                  variant="ghost"
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeSlash className="size-4" />
                  )}
                </Button>
              </InputGroup.Suffix>
            </InputGroup>
            <FieldError>{errors.password}</FieldError>
          </TextField>
          <TextField isInvalid={!!errors.confirmPassword} className="w-full">
            <Label className={styles.label}>Confirmar a senha</Label>
            <InputGroup fullWidth className={styles.input}>
              <InputGroup.Input
                name="confirmPassword"
                placeholder="Insira a senha"
                type={isConfirmPasswordVisible ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <InputGroup.Suffix className="pr-0">
                <Button
                  isIconOnly
                  aria-label={
                    isConfirmPasswordVisible
                      ? "Esconder senha"
                      : "Mostrar senha"
                  }
                  size="sm"
                  variant="ghost"
                  onPress={() =>
                    setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                  }
                >
                  {isConfirmPasswordVisible ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeSlash className="size-4" />
                  )}
                </Button>
              </InputGroup.Suffix>
            </InputGroup>
            <FieldError>{errors.confirmPassword}</FieldError>
          </TextField>
          <Button
            type="submit"
            className={styles.button}
            isDisabled={isLoading}
          >
            {isLoading ? <Spinner /> : "Enviar link"}
          </Button>
        </Form>
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

export default ResetPasswordPage;
