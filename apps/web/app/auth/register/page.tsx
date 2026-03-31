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
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setValue("cpf", value, { shouldValidate: false });
  };

  return (
    <div className="w-full px-4 py-8 flex items-start justify-center bg-[#f8fafc]">
      <div className="w-full max-w-[600px] p-10 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-[#e2e8f0] bg-white sm:p-6 sm:rounded-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-[#0f172a]">
            Crie sua conta
          </h1>
          <p className="text-sm text-[#64748b]">
            Preencha os dados abaixo para começar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#334155]">Eu sou</label>
            <div className="flex gap-4 flex-wrap sm:gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-[#334155] cursor-pointer">
                <input
                  type="radio"
                  value="PATIENT"
                  checked={role === "PATIENT"}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-4 h-4 accent-[#1b439b] bg-white cursor-pointer"
                />
                <span>Paciente</span>
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-[#334155] cursor-pointer">
                <input
                  type="radio"
                  value="PROFESSIONAL"
                  checked={role === "PROFESSIONAL"}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-4 h-4 accent-[#1b439b] bg-white cursor-pointer"
                />
                <span>Profissional</span>
              </label>
            </div>
          </div>

          <div className="w-full flex flex-col gap-1">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-[#334155]"
            >
              Nome completo
            </Label>
            <Input
              id="name"
              placeholder="Ex: Maria Silva"
              type="text"
              className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="w-full flex flex-col gap-1">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-[#334155]"
            >
              E-mail
            </Label>
            <Input
              id="email"
              placeholder="jane@example.com"
              type="email"
              className="h-12 px-4 py-3 rounded-lg border border-[#cbd5e1] text-sm text-[#334155] bg-white outline-none transition-all focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.1)]"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
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

          <Button
            type="submit"
            className="w-full mt-2 py-3 rounded-full border-none font-semibold text-white bg-gradient-to-br from-[#2563eb] to-[#0ea5e9] transition-transform hover:-translate-y-px hover:brightness-110 active:translate-y-0 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" /> : "Cadastrar"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[#64748b]">
          Já tem uma conta?
          <Link
            href="/auth/login"
            className="ml-1 no-underline font-medium text-[#2563eb] hover:underline"
          >
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
