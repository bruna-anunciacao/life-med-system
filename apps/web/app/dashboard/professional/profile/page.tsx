"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileAvatar } from "./components/ProfileAvatar";
import { ProfessionalInfoForm } from "./components/ProfessionalInfoForm";
import { SocialLinksForm } from "./components/SocialLinksForm";
import { useProfileForm } from "./useProfileForm";

export default function PerfilPage() {
  const {
    user,
    form,
    isLoading,
    isSaving,
    isEditing,
    setIsEditing,
    previewUrl,
    handleFileChange,
    handleCancel,
    onSubmit,
  } = useProfileForm();

  const { register, handleSubmit, formState: { errors } } = form;

  if (isLoading) {
    return (
      <div className="py-24 px-8 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen mx-auto px-16 py-8 bg-[#f8fafc]">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Meu Perfil</h1>
          <p className="mt-1 text-base text-gray-500">Gerencie suas informações profissionais.</p>
        </div>
        <Button
          size="lg"
          onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
          variant={isEditing ? "secondary" : "default"}
        >
          {isEditing ? "Cancelar" : "Editar Perfil"}
        </Button>
      </div>

      <Card className="border border-gray-200 rounded-xl bg-white">
        <CardContent className="p-8 space-y-8">
          <div className="flex items-center gap-5 max-[425px]:flex-col">
            <ProfileAvatar
              name={user?.name || ""}
              photoUrl={user?.professionalProfile?.photoUrl || null}
              previewUrl={previewUrl}
              isEditing={isEditing}
              onFileChange={handleFileChange}
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-[0.9rem] text-gray-500">{user?.email}</p>
              <p className="mt-1 px-[0.6rem] py-[0.15rem] inline-block rounded-2xl bg-[rgba(0,111,238,0.08)] text-xs font-semibold text-[#006fee]">
                {user?.professionalProfile?.specialities?.[0]?.name || "Especialidade não informada"}
              </p>
            </div>
          </div>

          <Separator />
          <h3 className="mt-2 text-base font-semibold text-gray-700">Informações Pessoais</h3>

          <form onSubmit={handleSubmit(onSubmit)} id="profile-form">
            <ProfessionalInfoForm
              email={user?.email || ""}
              isEditing={isEditing}
              register={register}
              errors={errors}
            />

            <h3 className="mt-2 pt-[0.8rem] text-base font-semibold text-gray-700">Links Sociais</h3>

            <SocialLinksForm isEditing={isEditing} register={register} />
          </form>

          {isEditing && (
            <div className="flex justify-end">
              <Button size="xl" type="submit" form="profile-form" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
