"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import styles from "./user-profile.module.css";
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
    handleCancel,
    onSubmitPatient,
    onSubmitProfessional,
  } = useAdminUserForm();

  if (isLoading) return <div className={styles.loadingContainer}><Spinner size="lg" /></div>;

  if (!user) {
    return (
      <section className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Perfil do Usuário</h1>
            <p className={styles.subtitle}>{error ?? "Usuário não encontrado."}</p>
          </div>
          <Button className={styles.editButton} onClick={() => router.back()}>Voltar</Button>
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
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Perfil do Usuário</h1>
          <p className={styles.subtitle}>Visualização e edição de dados cadastrais.</p>
        </div>
        <div className={styles.headerActions}>
          <Button className={styles.editButton} onClick={() => router.back()}>Voltar</Button>
          <Button
            className={styles.editButton}
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            disabled={isSaving}
          >
            {isEditing ? "Cancelar edição" : "Editar dados"}
          </Button>
        </div>
      </div>

      <Card className={styles.card}>
        <CardContent className="p-12 space-y-8">
          <UserProfileHeader
            name={user.name}
            email={user.email}
            role={user.role}
            specialty={user.professionalProfile?.specialty}
            photoUrl={fullPhotoUrl}
          />

          <Separator />

          {user.role === "PATIENT" && (
            <form id="admin-patient-form" onSubmit={patientForm.handleSubmit(onSubmitPatient)}>
              <PatientProfileForm
                register={patientForm.register}
                errors={patientForm.formState.errors}
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
              />
            </form>
          )}

          {isEditing && (
            <>
              <Separator />
              <div className={styles.actionsRow}>
                <Button
                  className={styles.editButton}
                  type="submit"
                  form={user.role === "PATIENT" ? "admin-patient-form" : "admin-professional-form"}
                  disabled={isSaving}
                >
                  {isSaving ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default AdminUserProfilePage;
