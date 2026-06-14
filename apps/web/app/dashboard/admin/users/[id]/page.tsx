"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AddressForm } from "@/components/address/AddressForm";
import { UserProfileHeader } from "./components/UserProfileHeader";
import { PatientProfileForm } from "./components/PatientProfileForm";
import { ProfessionalProfileForm } from "./components/ProfessionalProfileForm";
import { useAdminUserForm } from "./useAdminUserForm";
import { ArrowLeft } from "lucide-react";
import { PageShell, PageHeader } from "../../../../ui/dashboard/page-shell";

const AdminUserProfilePage = () => {
  const {
    user,
    isLoading,
    isSaving,
    isEditing,
    setIsEditing,
    error,
    router,
    patientForm,
    professionalForm,
    specialities,
    handleCancel,
    onSubmitPatient,
    onSubmitProfessional,
  } = useAdminUserForm();

  if (isLoading) return (
    <PageShell className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </PageShell>
  );

  if (!user) {
    return (
      <PageShell>
        <Button
          onClick={() => router.push("/dashboard/admin")}
          variant="outline"
          className="mb-6"
          title="Voltar para a listagem de usuários"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <PageHeader
          title="Perfil do Usuário"
          description={error ?? "Usuário não encontrado."}
        />
      </PageShell>
    );
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const photoPath = user.professionalProfile?.photoUrl;
  const canEditProfile = user.role === "PATIENT" || user.role === "PROFESSIONAL";
  const fullPhotoUrl = photoPath
    ? photoPath.startsWith("http") ? photoPath : `${apiBaseUrl}${photoPath}`
    : null;

  return (
    <PageShell>
      <Button
        onClick={() => router.push("/dashboard/admin")}
        variant="outline"
        className="mb-6"
        title="Voltar para a listagem de usuários"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <PageHeader
        title="Perfil do Usuário"
        description="Visualização e edição de dados cadastrais."
      />

      <Card className="border border-gray-200 rounded-xl bg-white">
        <CardContent className="p-8 space-y-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <UserProfileHeader
              name={user.name}
              email={user.email}
              role={user.role}
              specialty={user.professionalProfile?.specialities?.[0]?.name}
              photoUrl={fullPhotoUrl}
            />
            {canEditProfile && (
              <Button
                size="lg"
                onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
                disabled={isSaving}
                title={isEditing ? "Cancelar alterações e sair do modo de edição" : "Habilitar edição dos dados do usuário"}
              >
                {isEditing ? "Cancelar edição" : "Editar dados"}
              </Button>
            )}
          </div>

          <Separator />

          {user.role === "PATIENT" && (
            <form id="admin-patient-form" onSubmit={patientForm.handleSubmit(onSubmitPatient)}>
              <PatientProfileForm
                register={patientForm.register}
                errors={patientForm.formState.errors}
                control={patientForm.control}
                isEditing={isEditing}
              />
            </form>
          )}

          {user.role === "PROFESSIONAL" && (
            <form id="admin-professional-form" onSubmit={professionalForm.handleSubmit(onSubmitProfessional)}>
              <ProfessionalProfileForm
                register={professionalForm.register}
                errors={professionalForm.formState.errors}
                isEditing={isEditing}
                specialities={specialities}
              />
            </form>
          )}

          {isEditing && canEditProfile && (
            <>
              <Separator />
              <div className="mt-6 flex justify-end">
                <Button 
                  size="xl" 
                  type="submit" 
                  form={user.role === "PATIENT" ? "admin-patient-form" : "admin-professional-form"} 
                  disabled={isSaving}
                  title="Salvar todas as alterações realizadas no perfil"
                >
                  {isSaving ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border border-gray-200 rounded-xl bg-white mt-8">
        <CardContent className="p-8 space-y-6">
          <AddressForm userId={user?.id || ""} />
        </CardContent>
      </Card>
    </PageShell>
  );
};

export default AdminUserProfilePage;