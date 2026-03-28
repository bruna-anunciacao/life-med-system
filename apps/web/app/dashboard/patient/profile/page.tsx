"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePatientProfileForm } from "./usePatientProfileForm";
import { PatientInfoForm } from "./components/PatientInfoForm";
import styles from "./profile.module.css";

const PatientProfilePage = () => {
  const { user, isLoading, isSaving, isEditing, setIsEditing, form, handleCancel, onSubmit } =
    usePatientProfileForm();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Meu Perfil</h1>
          <p className={styles.subtitle}>Gerencie suas informações pessoais.</p>
        </div>
        <Button
          className={styles.editButton}
          onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
        >
          {isEditing ? "Cancelar" : "Editar Perfil"}
        </Button>
      </div>

      <Card className={styles.card}>
        <CardContent className="p-12 space-y-8">
          <div className={styles.cardHeader}>
            <div className={styles.avatarNoPhoto}>
              {user?.name?.charAt(0).toUpperCase() || "P"}
            </div>
            <div>
              <h2 className={styles.cardTitle}>{user?.name}</h2>
              <p className={styles.cardEmail}>{user?.email}</p>
              <span className={styles.cardRole}>Paciente</span>
            </div>
          </div>

          <Separator />

          <h3 className={styles.sectionLabel}>Informações Pessoais</h3>

          <form id="patient-profile-form" onSubmit={form.handleSubmit(onSubmit)}>
            <PatientInfoForm
              register={form.register}
              errors={form.formState.errors}
              email={user?.email || ""}
              isEditing={isEditing}
            />
          </form>

          {isEditing && (
            <>
              <Separator />
              <div className="flex justify-end">
                <Button
                  className={styles.saveButton}
                  type="submit"
                  form="patient-profile-form"
                  disabled={isSaving}
                >
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
