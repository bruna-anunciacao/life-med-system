"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import styles from "./profile.module.css";
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
    return <div className={styles.loadingContainer}><Spinner size="lg" /></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Meu Perfil</h1>
          <p className={styles.subtitle}>Gerencie suas informações profissionais.</p>
        </div>
        <Button
          className={isEditing ? styles.cancelButton : styles.editButton}
          onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
          variant={isEditing ? "secondary" : "default"}
        >
          {isEditing ? "Cancelar" : "Editar Perfil"}
        </Button>
      </div>

      <Card className={styles.card}>
        <CardContent className="p-8 space-y-8">
          <div className={styles.cardHeader}>
            <ProfileAvatar
              name={user?.name || ""}
              photoUrl={user?.professionalProfile?.photoUrl || null}
              previewUrl={previewUrl}
              isEditing={isEditing}
              onFileChange={handleFileChange}
            />
            <div>
              <h2 className={styles.cardTitle}>{user?.name}</h2>
              <p className={styles.cardEmail}>{user?.email}</p>
              <p className={styles.cardRole}>{user?.professionalProfile?.specialty}</p>
            </div>
          </div>

          <Separator />
          <h3 className={styles.sectionLabel}>Informações Pessoais</h3>

          <form onSubmit={handleSubmit(onSubmit)} id="profile-form">
            <ProfessionalInfoForm
              email={user?.email || ""}
              isEditing={isEditing}
              register={register}
              errors={errors}
            />

            <h3 className={styles.socialLinksTitle}>Links Sociais</h3>

            <SocialLinksForm isEditing={isEditing} register={register} />
          </form>

          {isEditing && (
            <div className="flex justify-end">
              <Button
                className={styles.saveButton}
                type="submit"
                form="profile-form"
                disabled={isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
