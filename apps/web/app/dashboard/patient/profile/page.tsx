"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePatientProfileForm } from "./usePatientProfileForm";
import { PatientInfoForm } from "./components/PatientInfoForm";

const PatientProfilePage = () => {
  const { user, isLoading, isSaving, isEditing, setIsEditing, form, handleCancel, onSubmit } =
    usePatientProfileForm();

  if (isLoading) {
    return (
      <div className="py-24 px-8 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <section className="w-full min-h-screen mx-auto px-16 py-8 bg-[#f8fafc]">
      <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Meu Perfil</h1>
          <p className="mt-1 text-base text-gray-500">Gerencie suas informações pessoais.</p>
        </div>
        <Button size="lg" onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}>
          {isEditing ? "Cancelar" : "Editar Perfil"}
        </Button>
      </div>

      <Card className="border border-gray-200 rounded-xl bg-white">
        <CardContent className="p-12 space-y-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#e6f1ff] border-2 border-[#006fee] text-2xl font-bold text-[#006fee] flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "P"}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="mt-1 px-2.5 py-0.5 inline-block rounded-full bg-[rgba(0,111,238,0.08)] text-xs font-semibold text-[#006fee]">Paciente</span>
            </div>
          </div>

          <Separator />

          <h3 className="mt-2 text-base font-semibold text-gray-700">Informações Pessoais</h3>

          <form id="patient-profile-form" onSubmit={form.handleSubmit(onSubmit)}>
            <PatientInfoForm
              register={form.register}
              control={form.control}
              errors={form.formState.errors}
              email={user?.email || ""}
              isEditing={isEditing}
            />
          </form>

          {isEditing && (
            <>
              <Separator />
              <div className="flex justify-end">
                <Button size="xl" type="submit" form="patient-profile-form" disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default PatientProfilePage;
