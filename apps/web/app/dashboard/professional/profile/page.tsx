"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { Divider } from "@heroui/divider";
import { Card, CardBody } from "@heroui/card";
import { usersService } from "../../../../services/users-service";
import { toast } from "sonner";
import * as z from "zod";
import styles from "./profile.module.css";

const formValidation = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      "Nome deve conter apenas letras, espaços, hífens e apóstrofos",
    ),
  email: z.email("Email inválido"),
  professionalLicense: z
    .string()
    .min(1, "Registro profissional é obrigatório")
    .max(20, "Registro profissional deve ter no máximo 20 caracteres"),
  specialty: z
    .string()
    .min(2, "Especialidade deve ter no mínimo 2 caracteres")
    .max(100, "Especialidade deve ter no máximo 100 caracteres")
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      "Especialidade deve conter apenas letras, espaços, hífens e apóstrofos",
    ),
  subspecialty: z.string().optional(),
  modality: z.enum(["VIRTUAL", "HOME_VISIT", "CLINIC"]),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  socialLinks: z.object({
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
    other: z.string().optional(),
  }),
});

type ProfessionalProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  professionalProfile?: {
    id: string;
    professionalLicense?: string;
    specialty?: string;
    subspecialty?: string;
    modality?: string;
    bio?: string;
    photoUrl?: string;
    socialLinks?: {
      linkedin?: string;
      instagram?: string;
      other?: string;
    };
  };
};

export default function PerfilPage() {
  const [user, setUser] = useState<ProfessionalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    professionalLicense: "",
    specialty: "",
    subspecialty: "",
    modality: "VIRTUAL",
    bio: "",
    photoUrl: "",
    socialLinks: {
      linkedin: "",
      instagram: "",
      other: "",
    },
  });

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await usersService.getUser();
      setUser(response);
      setFormData({
        name: response.name,
        email: response.email,
        professionalLicense:
          response.professionalProfile?.professionalLicense || "",
        specialty: response.professionalProfile?.specialty || "",
        subspecialty: response.professionalProfile?.subspecialty || "",
        modality: response.professionalProfile?.modality as
          | "VIRTUAL"
          | "HOME_VISIT"
          | "CLINIC",
        bio: response.professionalProfile?.bio || "",
        photoUrl: response.professionalProfile?.photoUrl || "",
        socialLinks: response.professionalProfile?.socialLinks || {
          linkedin: "",
          instagram: "",
          other: "",
        },
      });
    } catch {
      toast.error("Erro ao carregar perfil.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    setValidationErrors({});
    const result = formValidation.safeParse(formData);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName) {
          formattedErrors[String(fieldName)] = issue.message;
        }
      });
      setValidationErrors(formattedErrors);
      return;
    }

    try {
      setIsSaving(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("professionalLicense", formData.professionalLicense);
      data.append("specialty", formData.specialty);
      data.append("subspecialty", formData.subspecialty);
      data.append("modality", formData.modality);
      data.append("bio", formData.bio || "");
      data.append("socialLinks[linkedin]", formData.socialLinks.linkedin || "");
      data.append(
        "socialLinks[instagram]",
        formData.socialLinks.instagram || "",
      );
      data.append("socialLinks[other]", formData.socialLinks.other || "");

      if (selectedFile) {
        data.append("photo", selectedFile);
      }

      await usersService.updateProfile(data);

      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
      setSelectedFile(null);
      await loadProfile();
    } catch {
      toast.error("Erro ao salvar alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      professionalLicense: user?.professionalProfile?.professionalLicense || "",
      specialty: user?.professionalProfile?.specialty || "",
      subspecialty: user?.professionalProfile?.subspecialty || "",
      modality: user?.professionalProfile?.modality as
        | "VIRTUAL"
        | "HOME_VISIT"
        | "CLINIC",
      bio: user?.professionalProfile?.bio || "",
      photoUrl: user?.professionalProfile?.photoUrl || "",
      socialLinks: user?.professionalProfile?.socialLinks as {
        linkedin: "";
        instagram: "";
        other: "";
      },
    });
    setValidationErrors({});
    setIsEditing(false);
    setIsSaving(false);
  };

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  const renderAvatar = (user: ProfessionalProfile) => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    let currentPhoto = previewUrl;

    if (!currentPhoto && user.professionalProfile?.photoUrl) {
      const path = user.professionalProfile.photoUrl;
      currentPhoto = path.startsWith("http") ? path : `${apiBaseUrl}${path}`;
    }
    if (currentPhoto) {
      return (
        <div className="relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPhoto}
            alt={user.name}
            className={`${styles.avatar} object-cover rounded-full`}
            style={{ width: "70px", height: "70px" }}
          />
          {isEditing && (
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-bold">Trocar</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
      );
    }

    return (
      <label className="relative cursor-pointer">
        <div className={styles.avatarNoPhoto}>
          {user?.name.charAt(0).toUpperCase()}
        </div>
        {isEditing && (
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        )}
      </label>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Meu Perfil</h1>
          <p className={styles.subtitle}>
            Gerencie suas informações profissionais.
          </p>
        </div>

        <Button
          className={isEditing ? styles.cancelButton : styles.editButton}
          onPress={() => (isEditing ? handleCancel() : setIsEditing(true))}
          variant={isEditing ? "secondary" : "primary"}
        >
          {isEditing ? "Cancelar" : "Editar Perfil"}
        </Button>
      </div>

      <Card className={styles.card}>
        <CardBody className="p-8 space-y-8">
          <div className={styles.cardHeader}>
            {renderAvatar(user as ProfessionalProfile)}
            <div>
              <h2 className={styles.cardTitle}>{user?.name}</h2>
              <p className={styles.cardEmail}>{user?.email}</p>
              <p className={styles.cardRole}>
                {user?.professionalProfile?.specialty}
              </p>
            </div>
          </div>

          <Divider />

          <h3 className={styles.sectionLabel}>Informações Pessoais</h3>

          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Nome Completo</label>
              <input
                type="text"
                name="name"
                className={styles.fieldInput}
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
              {validationErrors.name && (
                <span className={styles.fieldError}>
                  {validationErrors.name}
                </span>
              )}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Email</label>
              <input
                type="email"
                name="email"
                className={styles.fieldInput}
                value={user?.email || ""}
                disabled
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>CRM</label>
              <input
                type="text"
                name="professionalLicense"
                className={styles.fieldInput}
                value={formData.professionalLicense}
                onChange={handleChange}
                disabled={!isEditing}
              />
              {validationErrors.professionalLicense && (
                <span className={styles.fieldError}>
                  {validationErrors.professionalLicense}
                </span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Especialidade</label>
              <input
                type="text"
                name="specialty"
                className={styles.fieldInput}
                value={formData.specialty}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Subespecialidade</label>
              <input
                type="text"
                name="subspecialty"
                className={styles.fieldInput}
                value={formData.subspecialty}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Modalidade</label>
              <select
                id="modality"
                name="modality"
                value={formData.modality}
                onChange={handleChange}
                className={styles.fieldSelect}
                disabled={!isEditing}
              >
                <option value="VIRTUAL">Virtual</option>
                <option value="HOME_VISIT">Domiciliar</option>
                <option value="CLINIC">Clínica</option>
              </select>
              {validationErrors.modality && (
                <span className={styles.fieldError}>
                  {validationErrors.modality}
                </span>
              )}
            </div>
          </div>

          <div className={styles.textAreaGroup}>
            <label className={styles.fieldLabel}>Biografia Profissional</label>
            <textarea
              id="bio"
              name="bio"
              placeholder="Ex: Sou um profissional de saúde com 10 anos de experiência"
              disabled={!isEditing}
              rows={4}
              className={styles.textArea}
              value={formData.bio}
              onChange={handleChange}
            />
            {validationErrors.bio && (
              <span className={styles.fieldError}>{validationErrors.bio}</span>
            )}
          </div>

          <h3 className={styles.socialLinksTitle}>Links Sociais</h3>

          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>LinkedIn</label>
              <input
                type="text"
                name="linkedin"
                className={styles.fieldInput}
                value={formData.socialLinks.linkedin}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    socialLinks: {
                      ...prev.socialLinks,
                      linkedin: e.target.value,
                    },
                  }))
                }
                disabled={!isEditing}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Instagram</label>
              <input
                type="text"
                name="instagram"
                className={styles.fieldInput}
                value={formData.socialLinks.instagram}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    socialLinks: {
                      ...prev.socialLinks,
                      instagram: e.target.value,
                    },
                  }))
                }
                disabled={!isEditing}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Outro</label>
              <input
                type="text"
                name="other"
                className={styles.fieldInput}
                value={formData.socialLinks.other}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    socialLinks: {
                      ...prev.socialLinks,
                      other: e.target.value,
                    },
                  }))
                }
                disabled={!isEditing}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <Button
                className={styles.saveButton}
                onPress={handleSave}
                isDisabled={isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
