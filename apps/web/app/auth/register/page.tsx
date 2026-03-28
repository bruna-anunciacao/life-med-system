"use client";

import Link from "next/link";
import styles from "../auth.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useRegisterForm } from "./useRegisterForm";
import { PatientFields } from "./components/PatientFields";
import { ProfessionalFields } from "./components/ProfessionalFields";
import { PasswordField } from "./components/PasswordField";

const RegisterPage = () => {
  const { form, role, isLoading, handleRoleChange, onSubmit } = useRegisterForm();
  const { register, handleSubmit, control, setValue, formState: { errors } } = form;

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setValue("cpf", value, { shouldValidate: false });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Crie sua conta</h1>
          <p className={styles.subtitle}>Preencha os dados abaixo para começar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Eu sou</label>
            <div className={styles.radioWrapper}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  value="PATIENT"
                  checked={role === "PATIENT"}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className={styles.nativeRadio}
                />
                <span>Paciente</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  value="PROFESSIONAL"
                  checked={role === "PROFESSIONAL"}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className={styles.nativeRadio}
                />
                <span>Profissional</span>
              </label>
            </div>
          </div>

          <div className="w-full flex flex-col gap-1">
            <Label htmlFor="name" className={styles.label}>Nome completo</Label>
            <Input
              id="name"
              placeholder="Ex: Maria Silva"
              type="text"
              className={styles.input}
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="w-full flex flex-col gap-1">
            <Label htmlFor="email" className={styles.label}>E-mail</Label>
            <Input
              id="email"
              placeholder="jane@example.com"
              type="email"
              className={styles.input}
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {role === "PATIENT" && (
            <PatientFields
              register={register}
              control={control}
              errors={errors}
              isLoading={isLoading}
              onCpfChange={handleCpfChange}
            />
          )}

          {role === "PROFESSIONAL" && (
            <ProfessionalFields register={register} errors={errors} />
          )}

          <PasswordField name="password" label="Senha" register={register} errors={errors} />
          <PasswordField name="confirmPassword" label="Confirmar a senha" register={register} errors={errors} />

          <Button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : "Cadastrar"}
          </Button>
        </form>

        <div className={styles.footer}>
          Já tem uma conta?
          <Link href="/auth/login" className={styles.link}>Faça login</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
