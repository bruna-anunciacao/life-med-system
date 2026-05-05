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
    <div className="py-24 px-8 flex justify-center items-center">
      <Spinner size="lg" />
    </div>
  );

  if (!user) {
    return (
      <section className="w-full min-h-screen mx-auto px-16 py-8 bg-[#f8fafc]">
        <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Perfil do Usuário</h1>
            <p className="mt-1 text-base text-gray-500">{error ?? "Usuário não encontrado."}</p>
          </div>
          <Button 
            size="lg" 
            onClick={() => router.back()}
            title="Voltar para a tela anterior"
          >
            Voltar
          </Button>
        </div>
      </section>
    );
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const photoPath = user.professionalProfile?.photoUrl;
  const fullPhotoUrl = photoPath
    ? photoPath.startsWith("http") ? photoPath : `${apiBaseUrl}${photoPath}`
    : null;

  return (
    <section className="w-full min-h-screen mx-auto px-16 py-8 bg-[#f8fafc]">
      <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Perfil do Usuário</h1>
          <p className="mt-1 text-base text-gray-500">Visualização e edição de dados cadastrais.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            size="lg" 
            onClick={() => router.back()}
            title="Voltar para a listagem de usuários"
          >
            Voltar
          </Button>
          <Button 
            size="lg" 
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))} 
            disabled={isSaving}
            title={isEditing ? "Cancelar alterações e sair do modo de edição" : "Habilitar edição dos dados do usuário"}
          >
            {isEditing ? "Cancelar edição" : "Editar dados"}
          </Button>
        </div>
      </div>

      <Card className="border border-gray-200 rounded-xl bg-white">
        <CardContent className="p-12 space-y-8">
          <UserProfileHeader
            name={user.name}
            email={user.email}
            role={user.role}
            specialty={user.professionalProfile?.specialities?.[0]?.name}
            photoUrl={fullPhotoUrl}
          />

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

          {isEditing && (
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
        <CardContent className="p-12 space-y-6">
          <AddressForm userId={user?.id || ""} />
        </CardContent>
      </Card>
    </section>
  );
};

export default AdminUserProfilePage;