"use client";

import React, { useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { usersService } from "../../../../services/users-service";
import { toast } from "sonner";
import styles from "./profile.module.css";
import * as z from "zod";

const profileValidation = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      "Nome deve conter apenas letras, espaços, hífens e apóstrofos",
    ),
  phone: z
    .string()
    .regex(
      /^\+[1-9]\d{6,14}$/,
      "Telefone deve estar no formato internacional (ex: +5571999999999)",
    )
    .or(z.literal("")),
  dateOfBirth: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
      },
      { message: "Data de nascimento não pode ser no futuro" },
    )
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        const ageDiff = Date.now() - date.getTime();
        const ageDate = new Date(ageDiff);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        return age <= 120;
      },
      { message: "Data de nascimento inválida" },
    ),
  gender: z
    .enum(["MALE", "FEMALE", "OTHER", "Masculino", "Feminino", "Outro", "Prefiro não informar", ""], {
      error: () => ({ message: "Selecione um gênero válido" }),
    }),
  address: z
    .string()
    .max(200, "Endereço deve ter no máximo 200 caracteres")
    .optional()
    .or(z.literal("")),
});

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  patientProfile?: {
    id: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
  };
};

const PatientProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [form, setForm] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await usersService.getUser();
      setUser(data);
      setForm({
        name: data.name || "",
        phone: data.patientProfile?.phone || "",
        dateOfBirth: data.patientProfile?.dateOfBirth
          ? (data.patientProfile.dateOfBirth.split("T")[0] ?? "")
          : "",
        gender: data.patientProfile?.gender || "",
        address: data.patientProfile?.address || "",
      });
    } catch {
      toast.error("Erro ao carregar perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
    const result = profileValidation.safeParse(form);

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
      await usersService.updateProfile({
        name: form.name,
        phone: form.phone || undefined,
      });
      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
      await loadProfile();
    } catch {
      toast.error("Erro ao salvar alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.patientProfile?.phone || "",
        dateOfBirth: user.patientProfile?.dateOfBirth
          ? (String(user.patientProfile.dateOfBirth).split("T")[0] ?? "")
          : "",
        gender: user.patientProfile?.gender || "",
        address: user.patientProfile?.address || "",
      });
    }
    setIsEditing(false);
  };

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
          <p className={styles.subtitle}>
            Gerencie suas informações pessoais.
          </p>
        </div>

        <Button
          className={styles.editButton}
          onPress={() => (isEditing ? handleCancel() : setIsEditing(true))}
        >
          {isEditing ? "Cancelar" : "Editar Perfil"}
        </Button>
      </div>

      <Card className={styles.card}>
        <CardBody className="p-12 space-y-8">
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

          <Divider />

          <h3 className={styles.sectionLabel}>Informações Pessoais</h3>

          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Nome Completo</label>
              <input
                type="text"
                name="name"
                className={styles.fieldInput}
                value={form.name}
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
                className={styles.fieldInput}
                value={user?.email || ""}
                disabled
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Telefone</label>
              <input
                type="tel"
                name="phone"
                className={styles.fieldInput}
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
              {validationErrors.phone && (
                <span className={styles.fieldError}>
                  {validationErrors.phone}
                </span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Data de Nascimento</label>
              <input
                type="date"
                name="dateOfBirth"
                className={styles.fieldInput}
                value={form.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditing}
              />
              {validationErrors.dateOfBirth && (
                <span className={styles.fieldError}>
                  {validationErrors.dateOfBirth}
                </span>
              )}
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
              {validationErrors.gender && (
                <span className={styles.fieldError}>
                  {validationErrors.gender}
                </span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Endereço</label>
              <input
                type="text"
                name="address"
                className={styles.fieldInput}
                placeholder="Rua, número, bairro, cidade"
                value={form.address}
                onChange={handleChange}
                disabled={!isEditing}
              />
              {validationErrors.address && (
                <span className={styles.fieldError}>
                  {validationErrors.address}
                </span>
              )}
            </div>
          </div>

          {isEditing && (
            <>
              <Divider />
              <div className="flex justify-end">
                <Button
                  className={styles.saveButton}
                  onPress={handleSave}
                  isDisabled={isSaving}
                >
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </section>
  );
};

export default PatientProfilePage;
