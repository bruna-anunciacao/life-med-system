"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "../auth.module.css";
import {
  FieldError,
  Input,
  Label,
  TextField,
  Form,
  InputGroup,
  Button,
  Spinner,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash } from "@gravity-ui/icons";
import * as z from "zod";
import { authService } from "../../../services/auth-service";
import { toast } from "sonner";

const formValidation = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
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
    setErrors({});
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
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      toast.success(`Bem-vindo(a), ${response.user.name}!`);
      resetForm();
      switch (response.user.role) {
        case "PROFESSIONAL":
          router.push("/dashboard/professional");
          break;
        case "PATIENT":
          router.push("/dashboard/patient");
          break;
        default:
          router.push("/dashboard/admin");
          break;
      }
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
          <h1 className={styles.title}>Bem-vindo de volta</h1>
          <p className={styles.subtitle}>Acesse sua conta para continuar</p>
        </div>
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

          <Link href="/auth/forgot-password" className={styles.forgotLink}>
            Esqueceu a senha?
          </Link>

          <Button type="submit" className={styles.button}>
            {isLoading ? <Spinner /> : "Entrar"}
          </Button>
        </Form>

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
