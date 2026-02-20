"use client";

import { useState } from "react";
import { Button, Input, Label, TextField } from "@heroui/react";
import { Divider } from "@heroui/divider";
import { Card, CardBody } from "@heroui/card";
import Image from "next/image";
import styles from "./profile.module.css";

export default function PerfilPage() {
  const [isEditing, setIsEditing] = useState(false);

  const renderAvatar = (name: string, photoUrl?: string) => {
    if (photoUrl) {
      return (
        <Image
          src={photoUrl}
          alt={name}
          width={48}
          height={48}
          className={styles.avatar}
        />
      );
    }

    return (
      <div className={styles.avatarNoPhoto}>{name.charAt(0).toUpperCase()}</div>
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
          className={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
          variant={isEditing ? "secondary" : "primary"}
        >
          {isEditing ? "Cancelar" : "Editar Perfil"}
        </Button>
      </div>

      <Card className={styles.card}>
        <CardBody className="p-8 space-y-8">
          <div className={styles.cardHeader}>
            {renderAvatar('J')}
            <div>
              <h2 className={styles.cardTitle}>Dr. João Silva</h2>
              <p className={styles.cardSpecialty}>Cardiologista</p>
              <p className={styles.cardEmail}>joao@email.com</p>
            </div>
          </div>

          <Divider />

          <div className="grid md:grid-cols-2 gap-6">
            <Input defaultValue="Dr. João Silva" disabled={!isEditing} />

            <Input defaultValue="joao@email.com" disabled />

            <Input defaultValue="CRM 123456" disabled={!isEditing} />

            <Input defaultValue="Cardiologia" disabled={!isEditing} />

            <Input defaultValue="Cardiologia Clínica" disabled={!isEditing} />
            <select
              id="modality"
              name="modality"
              value={""}
              disabled={!isEditing}
            >
              <option value="" disabled>
                Selecione
              </option>
              <option value="VIRTUAL">Virtual</option>
              <option value="HOME_VISIT">Domiciliar</option>
              <option value="CLINIC">Clínica</option>
            </select>
          </div>

          <Divider />
          <TextField className="w-full">
            <Label htmlFor="bio">Biografia Profissional</Label>
            <textarea
              id="bio"
              name="bio"
              placeholder="Ex: Sou um profissional de saúde com 10 anos de experiência"
              disabled={!isEditing}
              rows={4}
            />
          </TextField>
          <Divider />
          <div className="grid md:grid-cols-3 gap-6">
            <Input
              placeholder="https://linkedin.com/..."
              disabled={!isEditing}
            />

            <Input
              placeholder="https://instagram.com/..."
              disabled={!isEditing}
            />

            <Input placeholder="https://..." disabled={!isEditing} />
          </div>
          {isEditing && (
            <div className="flex justify-end">
              <Button size="lg">Salvar Alterações</Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
