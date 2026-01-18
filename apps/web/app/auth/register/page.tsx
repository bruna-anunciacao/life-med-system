"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../auth.module.css";
import {
  Button,
  FieldError,
  Form,
  Input,
  InputGroup,
  Label,
  Radio,
  RadioGroup,
  TextField,
  Spinner,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash } from "@gravity-ui/icons";
import * as z from "zod";
import { authService } from "../../../services/auth-service";
import { toast } from "sonner";

const registerPatientValidation = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "A senha deve ter no mínimo 6 caracteres"),
    role: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const registerProfessionalValidation = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "A senha deve ter no mínimo 6 caracteres"),
    role: z.string(),
    professionalLicense: z
      .string()
      .min(1, "Registro profissional é obrigatório"),
    specialty: z.string().min(1, "Especialidade é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const router = useRouter();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "PATIENT",
    professionalLicense: "",
    specialty: "",
  });

  const resetForm = (role: string) => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: role,
      professionalLicense: "",
      specialty: "",
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

  const handleRoleChange = (value: string) => {
    resetForm(value);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const schema =
      formData.role === "PROFESSIONAL"
        ? registerProfessionalValidation
        : registerPatientValidation;

    const result = schema.safeParse(formData);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName) {
          formattedErrors[String(fieldName)] = issue.message;
        }
      });

      setErrors(formattedErrors);
      setIsLoading(false);
      return;
    }

    try {
      if (formData.role === "PROFESSIONAL") {
        const data = result.data as z.infer<
          typeof registerProfessionalValidation
        >;

        await authService.registerProfessional({
          name: data.name,
          email: data.email,
          password: data.password,
          professionalLicense: data.professionalLicense,
          specialty: data.specialty,
        });
      } else {
        const data = result.data as z.infer<typeof registerPatientValidation>;

        await authService.registerPatient({
          name: data.name,
          email: data.email,
          password: data.password,
        });
      }

      toast.success("Seu cadastro foi realizado com sucesso!");
      resetForm(formData.role);
      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Erro ao realizar cadastro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Crie sua conta</h1>
          <p className={styles.subtitle}>
            Preencha os dados abaixo para começar
          </p>
        </div>

        <Form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <Label className={styles.label}>Eu sou</Label>
            <RadioGroup
              defaultValue="PATIENT"
              name="role"
              value={formData.role}
              onChange={handleRoleChange}
              orientation="horizontal"
            >
              <Radio value="PATIENT">
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Radio.Content>
                  <Label className={styles.label}>Paciente</Label>
                </Radio.Content>
              </Radio>
              <Radio value="PROFESSIONAL">
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Radio.Content>
                  <Label className={styles.label}>Profissional</Label>
                </Radio.Content>
              </Radio>
            </RadioGroup>
          </div>

          <TextField isInvalid={!!errors.name} className="w-full">
            <Label htmlFor="name" className={styles.label}>
              Nome Completo
            </Label>
            <Input
              id="name"
              placeholder="Ex: Maria Silva"
              type="text"
              name="name"
              className={styles.input}
              value={formData.name}
              onChange={handleChange}
            />
            <FieldError>{errors.name}</FieldError>
          </TextField>
          <TextField isInvalid={!!errors.email} className="w-full">
            <Label htmlFor="email" className={styles.label}>
              E-mail
            </Label>
            <Input
              id="email"
              placeholder="jane@example.com"
              type="email"
              name="email"
              className={styles.input}
              value={formData.email}
              onChange={handleChange}
            />
            <FieldError>{errors.email}</FieldError>
          </TextField>
          {formData.role === "PROFESSIONAL" && (
            <div className={styles.multipleInputs}>
              <TextField
                isInvalid={!!errors.professionalLicense}
                className="w-full"
              >
                <Label htmlFor="professionalLicense" className={styles.label}>
                  Registro Profissional (CRM/CRP)
                </Label>
                <Input
                  id="professionalLicense"
                  placeholder="Ex: 123456-SP"
                  type="string"
                  name="professionalLicense"
                  className={styles.input}
                  value={formData.professionalLicense}
                  onChange={handleChange}
                />
                <FieldError>{errors.professionalLicense}</FieldError>
              </TextField>
              <TextField isInvalid={!!errors.specialty} className="w-full">
                <Label htmlFor="specialty" className={styles.label}>
                  Especialidade
                </Label>
                <Input
                  id="specialty"
                  placeholder="Ex: Cardiologia"
                  type="string"
                  name="specialty"
                  className={styles.input}
                  value={formData.specialty}
                  onChange={handleChange}
                />
                <FieldError>{errors.specialty}</FieldError>
              </TextField>
            </div>
          )}

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

          <Button type="submit" className={styles.button}>
            {isLoading ? <Spinner /> : "Cadastrar"}
          </Button>
        </Form>

        <div className={styles.footer}>
          Já tem uma conta?
          <Link href="/auth/login" className={styles.link}>
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
