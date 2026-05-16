"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/app/auth/register/components/PasswordField";
import { applyCpfMask } from "@/lib/cpf";
import { useRegisterManagerMutation } from "@/queries/useRegisterManagerMutation";
import { registerManagerSchema, type RegisterManagerSchema } from "@/app/auth/register-manager/register-manager.validation";

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
    <section className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/admin")}
          title="Voltar para a tela do administrador"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cadastrar gestor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie uma conta de gestor vinculada à administração do sistema.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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
                <Input id="phone" type="tel" placeholder="+5571999999999" {...register("phone")} />
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

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/admin")}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Cadastrando..." : "Cadastrar gestor"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
