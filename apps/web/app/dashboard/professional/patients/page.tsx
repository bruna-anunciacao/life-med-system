"use client";

import React, { useState } from "react";
import { Button, InputGroup, TextField } from "@heroui/react";
import { SearchIcon, PlusIcon } from "../../../utils/icons";
import Image from "next/image";
import styles from "./patients.module.css";

type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit?: string;
  photoUrl?: string;
};

const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Maria Clara",
    email: "maria@email.com",
    phone: "(11) 99999-1111",
    lastVisit: "10/02/2026",
    photoUrl: "",
  },
  {
    id: "2",
    name: "Lucas Mendes",
    email: "lucas@email.com",
    phone: "(11) 98888-2222",
    lastVisit: "05/02/2026",
  },
  {
    id: "3",
    name: "Ana Souza",
    email: "ana@email.com",
    phone: "(11) 97777-3333",
  },
];

export default function PatientsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockPatients.filter((p) => {
    const term = search.toLowerCase();

    return Object.values(p)
      .filter((value) => typeof value === "string")
      .some((value) => value.toLowerCase().includes(term));
  });

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
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pacientes</h1>
          <p className={styles.subtitle}>
            Gerencie e visualize seus pacientes cadastrados.
          </p>
        </div>

        <Button className={styles.addButton}>
          <PlusIcon />
          Novo Paciente
        </Button>
      </div>

      <TextField className={styles.searchBar}>
        <InputGroup fullWidth className={styles.input}>
          <InputGroup.Input
            name="password"
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <SearchIcon />
        </InputGroup>
      </TextField>

      <div className={styles.grid}>
        {filtered.map((patient) => (
          <div key={patient.id} className={styles.card}>
            <div className={styles.cardHeader}>
              {renderAvatar(patient.name, patient.photoUrl)}
              <div>
                <h3 className={styles.patientName}>{patient.name}</h3>
                <p className={styles.email}>{patient.email}</p>
              </div>
            </div>

            <div className={styles.cardBody}>
              <p>
                <strong>Telefone:</strong> {patient.phone}
              </p>
              <p>
                <strong>Última Consulta:</strong> {patient.lastVisit ?? "—"}
              </p>
            </div>

            <div className={styles.cardFooter}>
              <Button size="sm" className={styles.profileButton}>
                Ver Perfil
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
