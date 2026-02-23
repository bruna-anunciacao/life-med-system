"use client";

import React, { useEffect, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { usersService } from "../../../../services/users-service";
import { toast } from "sonner";
import styles from "./profile.module.css";

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
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await usersService.completeProfile({
        name: form.name,
        phone: form.phone,
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
                type="text"
                name="address"
                className={styles.fieldInput}
                placeholder="Rua, número, bairro, cidade"
                value={form.address}
                onChange={handleChange}
                disabled={!isEditing}
              />
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
