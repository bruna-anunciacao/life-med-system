"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FormPageSkeleton } from "@/components/ui/skeletons";
import { PageShell, PageHeader } from "../../../ui/dashboard/page-shell";
import { TourButton } from "@/components/tour/TourButton";
import { useManagerProfileForm } from "./useManagerProfileForm";
import { ManagerInfoForm } from "./components/ManagerInfoForm";

const ManagerProfilePage = () => {
  const {
    user,
    isLoading,
    isSaving,
    isEditing,
    setIsEditing,
    form,
    handleCancel,
    onSubmit,
  } = useManagerProfileForm();

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
        help={<TourButton tour="manager-profile" />}
        actions={
          <Button
            id="tour-mgr-profile-edit"
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            title={isEditing ? "Cancelar edição" : "Habilitar edição do perfil"}
          >
            {isEditing ? "Cancelar" : "Editar Perfil"}
          </Button>
        }
      />

      <Card id="tour-mgr-profile-info">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {user?.name?.charAt(0).toUpperCase() || "G"}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {user?.name}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Gestor
              </span>
            </div>
          </div>

          <Separator />

          <form id="manager-profile-form" onSubmit={form.handleSubmit(onSubmit)}>
            <ManagerInfoForm
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
                  type="submit"
                  form="manager-profile-form"
                  disabled={isSaving}
                  title="Salvar todas as alterações feitas no perfil"
                  className="sm:px-8"
                >
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
};

export default ManagerProfilePage;
