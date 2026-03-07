"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Spinner } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { usersService } from "../../../../../services/users-service";
import { toast } from "sonner";
import styles from "./user-profile.module.css";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  patientProfile?: {
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    cpf?: string;
  };
  professionalProfile?: {
    professionalLicense?: string;
    specialty?: string;
    subspecialty?: string;
    modality?: string;
    bio?: string;
    photoUrl?: string;
    socialLinks?: {
      linkedin?: string;
      instagram?: string;
    };
  };
};

const statusTextMap: Record<string, string> = {
  VERIFIED: "Verificado",
  BLOCKED: "Bloqueado",
  PENDING: "Pendente",
  COMPLETED: "Completo",
};

const modalityTextMap: Record<string, string> = {
  VIRTUAL: "Virtual",
  HOME_VISIT: "Domiciliar",
  CLINIC: "Clínica",
};

const formatCpf = (cpf: string) => {
  const digits = cpf.replace(/\D/g, "");

  if (digits.length !== 11) {
    return cpf;
  }

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const AdminUserProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await usersService.getUserById(id);

        if (!data) {
          setError("Usuário não encontrado.");
          setUser(null);
          return;
        }

        setUser(data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Erro ao carregar perfil do usuário.";

        toast.error(message);
        setError(message);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <section className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Perfil do Usuário</h1>
            <p className={styles.subtitle}>
              {error ?? "Usuário não encontrado."}
            </p>
          </div>
          <Button className={styles.editButton} onPress={() => router.back()}>
            Voltar
          </Button>
        </div>
      </section>
    );
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const photoUrl = user?.professionalProfile?.photoUrl;
  const fullPhotoUrl = photoUrl
    ? photoUrl.startsWith("http") ? photoUrl : `${apiBaseUrl}${photoUrl}`
    : null;

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Perfil do Usuário</h1>
          <p className={styles.subtitle}>Visualização de dados cadastrais.</p>
        </div>
        <Button className={styles.editButton} onPress={() => router.back()}>
          Voltar
        </Button>
      </div>

      <Card className={styles.card}>
        <CardBody className="p-12 space-y-8">

          <div className={styles.cardHeader}>
            {fullPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fullPhotoUrl}
                alt={user?.name}
                style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div className={styles.avatarNoPhoto}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className={styles.cardTitle}>{user?.name}</h2>
              <p className={styles.cardEmail}>{user?.email}</p>
              <span className={styles.cardRole}>
                {user?.role === "PROFESSIONAL"
                  ? user.professionalProfile?.specialty || "Profissional"
                  : "Paciente"}
              </span>
            </div>
          </div>

          <Divider />

          {user?.role === "PATIENT" && (
            <>
              <h3 className={styles.sectionLabel}>Informações Pessoais</h3>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Nome Completo</label>
                  <input className={styles.fieldInput} value={user.name} disabled />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Email</label>
                  <input className={styles.fieldInput} value={user.email} disabled />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>CPF</label>
                  <input
                    className={styles.fieldInput}
                    value={user.patientProfile?.cpf ? formatCpf(user.patientProfile.cpf) : "Não informado"}
                    disabled
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Telefone</label>
                  <input className={styles.fieldInput} value={user.patientProfile?.phone || "Não informado"} disabled />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Data de Nascimento</label>
                  <input
                    className={styles.fieldInput}
                    value={
                      user.patientProfile?.dateOfBirth
                        ? new Date(user.patientProfile.dateOfBirth).toLocaleDateString("pt-BR")
                        : "Não informado"
                    }
                    disabled
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Gênero</label>
                  <input className={styles.fieldInput} value={user.patientProfile?.gender || "Não informado"} disabled />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Endereço</label>
                  <input className={styles.fieldInput} value={user.patientProfile?.address || "Não informado"} disabled />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Status</label>
                  <input className={styles.fieldInput} value={statusTextMap[user.status] || user.status} disabled />
                </div>
              </div>
            </>
          )}

          {user?.role === "PROFESSIONAL" && (
            <>
              <h3 className={styles.sectionLabel}>Informações Profissionais</h3>
              <div className={styles.formGrid}>
                
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Nome Completo</label>
                  <input className={styles.fieldInput} value={user.name} disabled />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Email</label>
                  <input className={styles.fieldInput} value={user.email} disabled />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>CRM</label>
                  <input className={styles.fieldInput} value={user.professionalProfile?.professionalLicense || "Não informado"} disabled />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Especialidade</label>
                  <input className={styles.fieldInput} value={user.professionalProfile?.specialty || "Não informado"} disabled />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Subespecialidade</label>
                  <input className={styles.fieldInput} value={user.professionalProfile?.subspecialty || "Não informado"} disabled />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Modalidade</label>
                  <input
                    className={styles.fieldInput}
                    value={modalityTextMap[user.professionalProfile?.modality || ""] || "Não informado"}
                    disabled
                  />
                </div>

              </div>

              <div className={styles.textAreaGroup}>
                <label className={styles.fieldLabel}>Biografia Profissional</label>
                <textarea
                  className={styles.textArea}
                  value={user.professionalProfile?.bio || "Não informado"}
                  rows={4}
                  disabled
                />
              </div>

              <Divider />
              <h3 className={styles.socialLinksTitle}>Links Sociais</h3>
              <div className={styles.formGrid}>
                
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Link de referência (LinkedIn/Lattes)</label>
                  <input className={styles.fieldInput} value={user.professionalProfile?.socialLinks?.linkedin || "Não informado"} disabled />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Instagram</label>
                  <input className={styles.fieldInput} value={user.professionalProfile?.socialLinks?.instagram || "Não informado"} disabled />
                </div>

              </div>

              <Divider />
              <div className={styles.statusGroup}>
                <label className={styles.fieldLabel}>Status</label>
                <input className={styles.fieldInput} value={statusTextMap[user.status] || user.status} disabled />
              </div>
            </>
          )}

        </CardBody>
      </Card>
    </section>
  );
};

export default AdminUserProfilePage;