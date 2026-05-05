"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useRegisterForm } from "./useRegisterForm";
import { PatientFields } from "./components/PatientFields";
import { ProfessionalFields } from "./components/ProfessionalFields";
import { PasswordField } from "./components/PasswordField";
import { LifeMedLogo } from "../../ui/life-med-logo";
import { applyCpfMask } from "@/lib/cpf";

const RegisterPage = () => {
  const { form, role, isLoading, handleRoleChange, onSubmit } =
    useRegisterForm();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("cpf", applyCpfMask(e.target.value), { shouldValidate: false });
  };

  return (
    <div className="w-full max-w-xl flex flex-col gap-4">
      {/* Header do form: logo + subtítulo */}
      <div className="flex flex-col">
        <Link href="/" className="w-fit mb-3">
          <LifeMedLogo width={160} className="h-auto" />
        </Link>
        <p className="text-sm text-[#6b7280]">
          Já tem uma conta?{" "}
          <Link href="/auth/login" className="text-[#2563eb] font-semibold hover:underline">
            Fazer login
          </Link>
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        {/* Seleção de perfil */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#374151]">Eu sou</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
              <input
                type="radio"
                value="PATIENT"
                checked={role === "PATIENT"}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-4 h-4 accent-[#2563eb] cursor-pointer"
              />
              Paciente
            </label>
            <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
              <input
                type="radio"
                value="PROFESSIONAL"
                checked={role === "PROFESSIONAL"}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-4 h-4 accent-[#2563eb] cursor-pointer"
              />
              Profissional
            </label>
          </div>
        </div>

        {/* Nome + E-mail em grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-sm font-semibold text-[#374151]">Nome completo</Label>
            <Input id="name" placeholder="Ex: Maria Silva" type="text" autoComplete="name" {...register("name")} />
            {errors.name && <p className="text-xs font-medium text-[#dc2626]">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-sm font-semibold text-[#374151]">E-mail</Label>
            <Input id="email" placeholder="seu@email.com" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-xs font-medium text-[#dc2626]">{errors.email.message}</p>}
          </div>
        </div>

        {/* Campos condicionais */}
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

        {/* Senhas em grid */}
        <div className="grid grid-cols-2 gap-3">
          <PasswordField
            name="password"
            label="Senha"
            register={register}
            errors={errors}
            showStrengthMeter={true}
            currentValue={watch("password")}
          />
          <PasswordField
            name="confirmPassword"
            label="Confirmar a senha"
            register={register}
            errors={errors}
          />
        </div>

        <Button type="submit" size="lg" className="w-full mt-1" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : "Cadastrar"}
        </Button>
      </form>
    </div>
  );
};

export default RegisterPage;
