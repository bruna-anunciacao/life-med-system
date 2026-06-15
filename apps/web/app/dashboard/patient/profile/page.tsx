"use client";

import { Button } from "@/components/ui/button";
import { FormPageSkeleton } from "@/components/ui/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AddressForm } from "@/components/address/AddressForm";
import { usePatientProfileForm } from "./usePatientProfileForm";
import { PatientInfoForm } from "./components/PatientInfoForm";
import { PageShell, PageHeader } from "../../../ui/dashboard/page-shell";
import { TourButton } from "@/components/tour/TourButton";
import { useIsMobile } from "@/hooks/useIsMobile";

const PatientProfilePage = () => {
  const {
    user,
    isLoading,
    isSaving,
    isEditing,
    setIsEditing,
    form,
    handleCancel,
    onSubmit,
  } = usePatientProfileForm();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <PageShell>
        <FormPageSkeleton />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Meu Perfil"
        description="Gerencie suas informações pessoais."
        help={<TourButton tour="patient-profile" iconOnly={isMobile} />}
        actions={
          <Button
            id="tour-profile-edit"
            size="lg"
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            title={isEditing ? "Cancelar edição" : "Habilitar edição do perfil"}
          >
            {isEditing ? "Cancelar" : "Editar Perfil"}
          </Button>
        }
      />

      <Card id="tour-profile-info" className="border border-gray-200 rounded-xl bg-white">
        <CardContent className="p-12 space-y-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#e6f1ff] border-2 border-[#006fee] text-2xl font-bold text-[#006fee] flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "P"}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.name}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="mt-1 px-2.5 py-0.5 inline-block rounded-full bg-[rgba(0,111,238,0.08)] text-xs font-semibold text-[#006fee]">
                Paciente
              </span>
            </div>
          </div>

          <Separator />

          <h3 className="mt-2 text-base font-semibold text-gray-700">
            Informações Pessoais
          </h3>

          <form
            id="patient-profile-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <PatientInfoForm
              register={form.register}
              control={form.control}
              errors={form.formState.errors}
              email={user?.email || ""}
              cpf={user?.cpf || ""}
              isEditing={isEditing}
            />
          </form>

          {isEditing && (
            <>
              <Separator />
              <div className="flex justify-end">
                <Button
                  size="xl"
                  type="submit"
                  form="patient-profile-form"
                  disabled={isSaving}
                  title="Salvar todas as alterações feitas no perfil"
                >
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card id="tour-profile-address" className="border border-gray-200 rounded-xl bg-white mt-8">
        <CardContent className="p-12 space-y-6">
          <AddressForm userId={user?.id || ""} />
        </CardContent>
      </Card>
    </PageShell>
  );
};

export default PatientProfilePage;
