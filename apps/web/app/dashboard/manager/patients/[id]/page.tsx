"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetPatientQuery } from "@/queries/useGetPatientQuery";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  managerService,
  type PatientApprovalStatus,
} from "@/services/manager-service";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  editPatientSchema,
  type EditPatientSchema,
} from "./edit-patient.validation";
import { AddressForm } from "@/components/address/AddressForm";
import { PhoneInputBR } from "@/components/ui/phone-input-br";
import { useQueryClient } from "@tanstack/react-query";
import { applyCpfMask } from "@/lib/cpf";
import { PageShell, PageHeader } from "../../../../ui/dashboard/page-shell";
import { DetailPageSkeleton } from "@/components/ui/skeletons";
import { VulnerabilityBadge } from "@/components/shared/VulnerabilityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";

const APPROVAL_ACTIONS: Array<{
  status: PatientApprovalStatus;
  label: string;
  variant: "default" | "outline" | "destructive";
}> = [
  { status: "APPROVED", label: "Aprovar", variant: "default" },
  { status: "PENDING", label: "Marcar em análise", variant: "outline" },
  { status: "REJECTED", label: "Rejeitar", variant: "destructive" },
];

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const queryClient = useQueryClient();

  const { data: patient, isLoading, error } = useGetPatientQuery(patientId);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingApproval, setIsUpdatingApproval] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EditPatientSchema>({
    resolver: zodResolver(editPatientSchema),
  });

  useEffect(() => {
    if (patient) {
      reset({
        name: patient.name || "",
        email: patient.email || "",
        cpf: patient.cpf ? applyCpfMask(patient.cpf) : "",
        phone: patient.phone || "",
        dateOfBirth: patient.dateOfBirth
          ? String(patient.dateOfBirth).split("T")[0]
          : "",
        gender: (patient.gender as EditPatientSchema["gender"]) || "",
      });
    }
  }, [patient, reset]);

  const onSubmit = async (data: EditPatientSchema) => {
    try {
      setIsSaving(true);

      const dataToSubmit = {
        ...data,
        cpf: data.cpf ? data.cpf.replace(/\D/g, "") : data.cpf,
      };

      await managerService.updatePatient(patientId, dataToSubmit);

      await queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      await queryClient.invalidateQueries({ queryKey: ["patients"] });

      toast.success("Paciente atualizado com sucesso!");
      setIsEditing(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao atualizar paciente",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (patient) {
      reset({
        name: patient.name || "",
        email: patient.email || "",
        cpf: patient.cpf ? applyCpfMask(patient.cpf) : "",
        phone: patient.phone || "",
        dateOfBirth: patient.dateOfBirth
          ? String(patient.dateOfBirth).split("T")[0]
          : "",
        gender: (patient.gender as EditPatientSchema["gender"]) || "",
      });
    }
    setIsEditing(false);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = applyCpfMask(e.target.value);
  };

  const handleApprovalStatusChange = async (
    approvalStatus: PatientApprovalStatus,
  ) => {
    try {
      setIsUpdatingApproval(true);
      await managerService.updatePatientApprovalStatus(
        patientId,
        approvalStatus,
      );
      await queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      await queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Status de aprovação atualizado com sucesso!");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao atualizar aprovação do paciente",
      );
    } finally {
      setIsUpdatingApproval(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <DetailPageSkeleton />
      </PageShell>
    );
  }

  if (error || !patient) {
    return (
      <PageShell>
        <div>
          <Button
            onClick={() => router.push("/dashboard/manager/patients")}
            variant="outline"
            className="mb-6"
            title="Voltar para a lista de pacientes"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Card>
            <CardContent className="p-6">
              <div
                className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800"
                role="alert"
              >
                {error instanceof Error
                  ? error.message
                  : "Erro ao carregar dados do paciente"}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div>
        <Button
          onClick={() => router.push("/dashboard/manager/patients")}
          variant="ghost"
          size="sm"
          className="mb-4"
          title="Voltar para a lista de pacientes"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <PageHeader
          title="Detalhes do Paciente"
          description={patient.email || "Email não informado"}
          actions={
            <Button
              onClick={() =>
                isEditing ? handleCancelEdit() : setIsEditing(true)
              }
              variant={isEditing ? "outline" : "default"}
              title={
                isEditing ? "Cancelar alterações" : "Habilitar modo de edição"
              }
              disabled={isSaving}
            >
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
          }
        />

        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground"
                  >
                    Nome Completo
                  </label>
                  <input
                    id="name"
                    {...register("name")}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-border rounded-lg transition-colors ${
                      isEditing
                        ? "bg-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                    title="Nome do paciente"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="cpf"
                    className="text-sm font-medium text-foreground"
                  >
                    CPF
                  </label>
                  <input
                    id="cpf"
                    {...register("cpf", {
                      onChange: handleCpfChange,
                    })}
                    disabled={!isEditing}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`w-full px-4 py-2 border border-border rounded-lg transition-colors ${
                      isEditing
                        ? "bg-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                    title="CPF do paciente"
                  />
                  {errors.cpf && (
                    <p className="text-xs text-destructive">
                      {errors.cpf.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-border rounded-lg transition-colors ${
                      isEditing
                        ? "bg-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Telefone
                  </label>
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
                        disabled={!isEditing}
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Data de Nascimento
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-border rounded-lg transition-colors text-foreground disabled:opacity-100 disabled:[color-scheme:light] ${
                      isEditing ? "bg-background" : "bg-muted"
                    }`}
                    {...register("dateOfBirth")}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Gênero
                  </label>
                  <select
                    id="gender"
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-border rounded-lg transition-colors ${
                      isEditing
                        ? "bg-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                    {...register("gender")}
                  >
                    <option value="">Selecione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                    <option value="Prefiro não informar">
                      Prefiro não informar
                    </option>
                  </select>
                  {errors.gender && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4 mt-6">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1"
                    title="Confirmar e salvar as alterações realizadas"
                  >
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="flex-1"
                    title="Descartar alterações e voltar para visualização"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="p-6">
            <AddressForm userId={patient?.id || ""} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Questionário de Vulnerabilidade
            </h2>
            <div className="rounded-lg border border-border bg-muted/30 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Status do questionário
                  </p>
                  <p className="font-medium text-foreground">
                    {patient.patientProfile?.questionnaireCompleted
                      ? "Respondido"
                      : "Pendente"}
                  </p>
                  {patient.patientProfile?.approvalStatus && (
                    <div className="pt-2">
                      <StatusBadge
                        status={patient.patientProfile.approvalStatus}
                        type="approval"
                        className="px-3"
                      />
                    </div>
                  )}
                  {patient.questionnaire && (
                    <VulnerabilityBadge
                      totalScore={patient.questionnaire.totalScore}
                      isVulnerable={patient.questionnaire.isVulnerable}
                    />
                  )}
                </div>

                <Link
                  href={`/dashboard/manager/patients/${patient.id}/questionnaire`}
                  title={
                    patient.questionnaire
                      ? "Editar as respostas do questionário"
                      : "Iniciar preenchimento do questionário"
                  }
                >
                  <Button
                    title={
                      patient.questionnaire
                        ? "Editar questionário"
                        : "Preencher questionário"
                    }
                  >
                    {patient.questionnaire
                      ? "Editar questionário"
                      : "Preencher questionário"}
                  </Button>
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                {APPROVAL_ACTIONS.map((action) => (
                  <Button
                    key={action.status}
                    type="button"
                    variant={action.variant}
                    disabled={
                      isUpdatingApproval ||
                      patient.patientProfile?.approvalStatus === action.status
                    }
                    onClick={() => handleApprovalStatusChange(action.status)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Informações do Sistema
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ID do Paciente</p>
                <p className="font-mono text-sm text-foreground break-all">
                  {patient.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium text-foreground">
                  {patient.status === "BLOCKED"
                    ? "Bloqueado"
                    : patient.status === "PENDING"
                      ? "Pendente"
                      : "Ativo"}
                </p>
              </div>
              {patient.createdAt && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Data de Cadastro
                  </p>
                  <p className="font-medium text-foreground">
                    {new Date(patient.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
              {patient.updatedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Última Atualização
                  </p>
                  <p className="font-medium text-foreground">
                    {new Date(patient.updatedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
