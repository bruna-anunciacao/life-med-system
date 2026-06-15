"use client";

import { Controller, useForm } from "react-hook-form";
import { PhoneInputBR } from "@/components/ui/phone-input-br";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/app/auth/register/components/PasswordField";
import { applyCpfMask } from "@/lib/cpf";
import { useRegisterManagerMutation } from "@/queries/useRegisterManagerMutation";
import { registerManagerSchema, type RegisterManagerSchema } from "./register-manager.validation";
import { PageShell, PageHeader } from "@/app/ui/dashboard/page-shell";
import { TourButton } from "@/components/tour/TourButton";

export default function RegisterManagerPage() {
  const router = useRouter();
  const { mutateAsync: registerManager, isPending } = useRegisterManagerMutation();

  const form = useForm<RegisterManagerSchema>({
    resolver: zodResolver(registerManagerSchema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      password: "",
      phone: "",
      bio: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = form;

  const onSubmit = async (data: RegisterManagerSchema) => {
    try {
      await registerManager({
        name: data.name.trim(),
        email: data.email.trim(),
        cpf: data.cpf.replace(/\D/g, ""),
        password: data.password,
        phone: data.phone.trim(),
        bio: data.bio?.trim() || undefined,
      });

      toast.success("Gestor cadastrado com sucesso!");
      router.push("/dashboard/admin");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao cadastrar gestor.",
      );
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("cpf", applyCpfMask(e.target.value), { shouldValidate: false });
  };

  return (
    <PageShell>
      <Link
        href="/dashboard/admin"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Painel Administrativo
      </Link>

      <PageHeader
        title="Cadastrar gestor"
        description="Crie uma conta de gestor vinculada à administração do sistema."
        help={<TourButton tour="admin-new-manager" />}
      />

      <div id="tour-admin-mgr-form" className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" placeholder="Ex: Maria Silva" {...register("name")} />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="gestor@clinica.com" {...register("email")} />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" placeholder="000.000.000-00" {...register("cpf")} onChange={handleCpfChange} />
                {errors.cpf && <p className="text-xs text-red-600">{errors.cpf.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInputBR
                      id="phone"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  )}
                />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
              </div>
            </div>

            <PasswordField
              name="password"
              label="Senha inicial"
              register={register}
              errors={errors}
              showStrengthMeter
              currentValue={watch("password")}
            />

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio (opcional)</Label>
              <textarea
                id="bio"
                rows={4}
                placeholder="Descreva brevemente o gestor"
                className="w-full rounded-lg border border-slate-300 bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                {...register("bio")}
              />
              {errors.bio && <p className="text-xs text-red-600">{errors.bio.message}</p>}
            </div>

            <div id="tour-admin-mgr-submit" className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/admin")}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Cadastrando..." : "Cadastrar gestor"}
              </Button>
            </div>
          </form>
      </div>
    </PageShell>
  );
}
