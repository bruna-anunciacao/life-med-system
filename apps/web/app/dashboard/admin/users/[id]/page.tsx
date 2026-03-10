"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    status: "",
    // campos de paciente
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    cpf: "",
    // campos de profissional
    professionalLicense: "",
    specialty: "",
    subspecialty: "",
    modality: "",
    bio: "",
    linkedin: "",
    instagram: "",
  });

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
      setForm({
        name: data.name || "",
        email: data.email || "",
        status: data.status || "",
        phone: data.patientProfile?.phone || "",
        dateOfBirth: data.patientProfile?.dateOfBirth
          ? data.patientProfile.dateOfBirth.split("T")[0] ?? ""
          : "",
        gender: data.patientProfile?.gender || "",
        address: data.patientProfile?.address || "",
        cpf: data.patientProfile?.cpf || "",
        professionalLicense:
          data.professionalProfile?.professionalLicense || "",
        specialty: data.professionalProfile?.specialty || "",
        subspecialty: data.professionalProfile?.subspecialty || "",
        modality: data.professionalProfile?.modality || "",
        bio: data.professionalProfile?.bio || "",
        linkedin: data.professionalProfile?.socialLinks?.linkedin || "",
        instagram: data.professionalProfile?.socialLinks?.instagram || "",
      });
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

  useEffect(() => {
    const shouldStartEditing = searchParams.get("edit") === "1";
    setIsEditing(shouldStartEditing);
  }, [searchParams]);

  useEffect(() => {
    void loadProfile();
  }, [id]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        status: user.status || "",
        phone: user.patientProfile?.phone || "",
        dateOfBirth: user.patientProfile?.dateOfBirth
          ? String(user.patientProfile.dateOfBirth).split("T")[0] ?? ""
          : "",
        gender: user.patientProfile?.gender || "",
        address: user.patientProfile?.address || "",
        cpf: user.patientProfile?.cpf || "",
        professionalLicense:
          user.professionalProfile?.professionalLicense || "",
        specialty: user.professionalProfile?.specialty || "",
        subspecialty: user.professionalProfile?.subspecialty || "",
        modality: user.professionalProfile?.modality || "",
        bio: user.professionalProfile?.bio || "",
        linkedin: user.professionalProfile?.socialLinks?.linkedin || "",
        instagram: user.professionalProfile?.socialLinks?.instagram || "",
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);

      const payload: any = {
        name: form.name,
        email: form.email,
        status: form.status as UserProfile["status"],
      };

      if (user.role === "PATIENT") {
        payload.phone = form.phone || undefined;
        payload.dateOfBirth = form.dateOfBirth || undefined;
        payload.gender = form.gender || undefined;
        payload.address = form.address || undefined;
        payload.cpf = form.cpf || undefined;
      }

      if (user.role === "PROFESSIONAL") {
        payload.professionalLicense = form.professionalLicense || undefined;
        payload.specialty = form.specialty || undefined;
        payload.subspecialty = form.subspecialty || undefined;
        payload.modality = form.modality || undefined;
        payload.bio = form.bio || undefined;
        payload.socialLinks = {
          linkedin: form.linkedin || undefined,
          instagram: form.instagram || undefined,
        };
      }

      await usersService.updateUser(user.id, payload);
      toast.success("Dados do usuário atualizados com sucesso.");
      setIsEditing(false);
      await loadProfile();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao salvar dados do usuário.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

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
          <p className={styles.subtitle}>Visualização e edição de dados cadastrais.</p>
        </div>
        <div className={styles.headerActions}>
          <Button className={styles.editButton} onPress={() => router.back()}>
            Voltar
          </Button>
          <Button
            className={styles.editButton}
            onPress={() => (isEditing ? handleCancel() : setIsEditing(true))}
            isDisabled={isSaving}
          >
            {isEditing ? "Cancelar edição" : "Editar dados"}
          </Button>
        </div>
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
                  <input
                    className={styles.fieldInput}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Email</label>
                  <input
                    className={styles.fieldInput}
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>CPF</label>
                  <input
                    className={styles.fieldInput}
                    name="cpf"
                    value={form.cpf}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Telefone</label>
                  <input
                    className={styles.fieldInput}
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Data de Nascimento</label>
                  <input
                    className={styles.fieldInput}
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Gênero</label>
                  <select
                    name="gender"
                    className={styles.fieldSelect}
                    value={form.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                    <option value="Prefiro não informar">
                      Prefiro não informar
                    </option>
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Endereço</label>
                  <input
                    className={styles.fieldInput}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Status</label>
                  <select
                    className={styles.fieldInput}
                    name="status"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    disabled={!isEditing}
                  >
                    <option value="PENDING">Pendente</option>
                    <option value="COMPLETED">Completo</option>
                    <option value="VERIFIED">Verificado</option>
                    <option value="BLOCKED">Bloqueado</option>
                  </select>
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
                  <input
                    className={styles.fieldInput}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Email</label>
                  <input
                    className={styles.fieldInput}
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>CRM</label>
                  <input
                    className={styles.fieldInput}
                    name="professionalLicense"
                    value={form.professionalLicense}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Especialidade</label>
                  <input
                    className={styles.fieldInput}
                    name="specialty"
                    value={form.specialty}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Subespecialidade</label>
                  <input
                    className={styles.fieldInput}
                    name="subspecialty"
                    value={form.subspecialty}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Modalidade</label>
                  <select
                    className={styles.fieldInput}
                    name="modality"
                    value={form.modality}
                    onChange={(e) =>
                      setForm({ ...form, modality: e.target.value })
                    }
                    disabled={!isEditing}
                  >
                    <option value="VIRTUAL">Virtual</option>
                    <option value="HOME_VISIT">Domiciliar</option>
                    <option value="CLINIC">Clínica</option>
                  </select>
                </div>

              </div>

              <div className={styles.textAreaGroup}>
                <label className={styles.fieldLabel}>Biografia Profissional</label>
                <textarea
                  className={styles.textArea}
                  name="bio"
                  value={form.bio}
                  rows={4}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <Divider />
              <h3 className={styles.socialLinksTitle}>Links Sociais</h3>
              <div className={styles.formGrid}>
                
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Link de referência (LinkedIn/Lattes)</label>
                  <input
                    className={styles.fieldInput}
                    name="linkedin"
                    value={form.linkedin}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Instagram</label>
                  <input
                    className={styles.fieldInput}
                    name="instagram"
                    value={form.instagram}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

              </div>

              <Divider />
              <div className={styles.statusGroup}>
                <label className={styles.fieldLabel}>Status</label>
                <select
                  className={styles.fieldInput}
                  name="status"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                  disabled={!isEditing}
                >
                  <option value="PENDING">Pendente</option>
                  <option value="COMPLETED">Completo</option>
                  <option value="VERIFIED">Verificado</option>
                  <option value="BLOCKED">Bloqueado</option>
                </select>
              </div>
            </>
          )}

          {isEditing && (
            <>
              <Divider />
              <div className={styles.actionsRow}>
                <Button
                  className={styles.editButton}
                  onPress={handleSave}
                  isDisabled={isSaving}
                >
                  {isSaving ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </section>
  );
};

export default AdminUserProfilePage;