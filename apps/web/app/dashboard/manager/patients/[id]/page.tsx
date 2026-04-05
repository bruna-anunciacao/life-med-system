"use client";

import { useGetPatientQuery } from "@/queries/useGetPatientQuery";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { managerService } from "@/services/manager-service";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const { data: patient, isLoading, error } = useGetPatientQuery(patientId);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });

  // Preencher formulário quando dados carregam
  if (patient && !isEditing && formData.phone === "") {
    setFormData({
      phone: patient.phone || "",
      dateOfBirth: patient.dateOfBirth || "",
      gender: patient.gender || "",
      address: patient.address || "",
    });
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await managerService.updatePatient(patientId, formData);
      toast.success("Paciente atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar paciente"
      );
    } finally {
      setIsSaving(false);
    }
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
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {error instanceof Error
                  ? error.message
                  : "Erro ao carregar dados do paciente"}
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
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-6"
        >
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
                <p className="text-slate-600">
                  {patient.email || "Email não informado"}
                </p>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
              >
                {isEditing ? "Cancelar" : "Editar"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={patient.email || ""}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={isEditing ? formData.phone : patient.phone || ""}
                  onChange={(e) =>
                    isEditing &&
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                    isEditing
                      ? "bg-white text-gray-700"
                      : "bg-gray-50 text-gray-700"
                  }`}
                />
              </div>

              {/* Data de Nascimento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={
                    isEditing
                      ? formData.dateOfBirth
                      : patient.dateOfBirth || ""
                  }
                  onChange={(e) =>
                    isEditing &&
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                    isEditing
                      ? "bg-white text-gray-700"
                      : "bg-gray-50 text-gray-700"
                  }`}
                />
              </div>

              {/* Gênero */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gênero
                </label>
                <select
                  value={isEditing ? formData.gender : patient.gender || ""}
                  onChange={(e) =>
                    isEditing && setFormData({ ...formData, gender: e.target.value })
                  }
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                    isEditing
                      ? "bg-white text-gray-700"
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  <option value="">Selecione...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outro</option>
                </select>
              </div>
            </div>

            {/* Endereço */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <textarea
                value={isEditing ? formData.address : patient.address || ""}
                onChange={(e) =>
                  isEditing &&
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={!isEditing}
                rows={4}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${
                  isEditing
                    ? "bg-white text-gray-700"
                    : "bg-gray-50 text-gray-700"
                }`}
              />
            </div>

            {/* Botões de Ação */}
            {isEditing && (
              <div className="flex gap-4 mt-6">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção de Informações Adicionais */}
        <Card className="bg-white">
          <CardContent className="p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Sistema
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">ID do Paciente</p>
                <p className="font-mono text-sm text-gray-900 break-all">
                  {patient.id}
                </p>
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
