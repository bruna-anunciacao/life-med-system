"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetPatientQuery } from "@/queries/useGetPatientQuery";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { managerService } from "@/services/manager-service";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { editPatientSchema, type EditPatientSchema } from "./edit-patient.validation";

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const { data: patient, isLoading, error } = useGetPatientQuery(patientId);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPatientSchema>({
    resolver: zodResolver(editPatientSchema),
  });

  useEffect(() => {
    if (patient) {
      reset({
        phone: patient.phone || "",
        dateOfBirth: patient.dateOfBirth
          ? String(patient.dateOfBirth).split("T")[0]
          : "",
        gender: (patient.gender as "M" | "F" | "O" | "") || "",
        address: patient.address || "",
      });
    }
  }, [patient, reset]);

  const onSubmit = async (data: EditPatientSchema) => {
    try {
      setIsSaving(true);
      await managerService.updatePatient(patientId, data);
      toast.success("Paciente atualizado com sucesso!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar paciente");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (patient) {
      reset({
        phone: patient.phone || "",
        dateOfBirth: patient.dateOfBirth
          ? String(patient.dateOfBirth).split("T")[0]
          : "",
        gender: (patient.gender as "M" | "F" | "O" | "") || "",
        address: patient.address || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <section className="min-h-screen w-full bg-slate-50 p-8">
        <div className="flex items-center justify-center">
          <p className="text-slate-600">Carregando detalhes do paciente...</p>
        </div>
      </section>
    );
  }

  if (error || !patient) {
    return (
      <section className="min-h-screen w-full bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Button onClick={() => router.back()} variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {error instanceof Error ? error.message : "Erro ao carregar dados do paciente"}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen w-full bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => router.back()} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="bg-white mb-6">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Detalhes do Paciente
                </h1>
                <p className="text-slate-600">{patient.email || "Email não informado"}</p>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
              >
                {isEditing ? "Cancelar" : "Editar"}
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={patient.email || ""}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                      isEditing ? "bg-white text-gray-700" : "bg-gray-50 text-gray-700"
                    }`}
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                      isEditing ? "bg-white text-gray-700" : "bg-gray-50 text-gray-700"
                    }`}
                    {...register("dateOfBirth")}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-xs text-red-600 mt-1">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gênero</label>
                  <select
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                      isEditing ? "bg-white text-gray-700" : "bg-gray-50 text-gray-700"
                    }`}
                    {...register("gender")}
                  >
                    <option value="">Selecione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                  {errors.gender && (
                    <p className="text-xs text-red-600 mt-1">{errors.gender.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                <textarea
                  disabled={!isEditing}
                  rows={4}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                    isEditing ? "bg-white text-gray-700" : "bg-gray-50 text-gray-700"
                  }`}
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-4 mt-6">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Questionário de Vulnerabilidade
            </h2>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">
                    Status do questionário
                  </p>
                  <p className="font-medium text-slate-900">
                    {patient.patientProfile?.questionnaireCompleted
                      ? "Respondido"
                      : "Pendente"}
                  </p>
                  {patient.questionnaire && (
                    <p className="text-sm text-slate-600">
                      Pontuação: {patient.questionnaire.totalScore} |{" "}
                      {patient.questionnaire.isVulnerable
                        ? "Vulnerável"
                        : "Não vulnerável"}
                    </p>
                  )}
                </div>

                <Link href={`/dashboard/manager/patients/${patient.id}/questionnaire`}>
                  <Button>
                    {patient.questionnaire ? "Editar questionário" : "Preencher questionário"}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white mt-6">
          <CardContent className="p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Sistema
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">ID do Paciente</p>
                <p className="font-mono text-sm text-gray-900 break-all">{patient.id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <p className="font-medium text-gray-900">{patient.status || "Ativo"}</p>
              </div>
              {patient.createdAt && (
                <div>
                  <p className="text-sm text-slate-600">Data de Cadastro</p>
                  <p className="font-medium text-gray-900">
                    {new Date(patient.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
              {patient.updatedAt && (
                <div>
                  <p className="text-sm text-slate-600">Última Atualização</p>
                  <p className="font-medium text-gray-900">
                    {new Date(patient.updatedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
