"use client";
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
import { Eye, EyeSlash } from "@gravity-ui/icons";
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
        <Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <TextField isInvalid={!!errors.email} className="w-full">
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
            <FieldError>{errors.email?.message as string}</FieldError>
          </TextField>

          <TextField isInvalid={!!errors.password} className="w-full">
            <Label className={styles.label}>Senha</Label>
            <InputGroup fullWidth className={styles.input}>
              <InputGroup.Input
                placeholder="Insira a senha"
                type={isPasswordVisible ? "text" : "password"}
                {...register("password")}
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
            <FieldError>{errors.password?.message as string}</FieldError>
          </TextField>

          <Link href="/auth/forgot-password" className={styles.forgotLink}>
            Esqueceu a senha?
          </Link>

          <Button
            type="submit"
            className={styles.button}
            isDisabled={isLoading}
            onPress={(e) => {
              const form = e.target.closest('form');
              if (form) form.requestSubmit();
            }}
          >
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
