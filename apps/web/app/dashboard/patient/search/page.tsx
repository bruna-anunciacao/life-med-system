"use client";

import React, { useEffect, useState } from "react";
import { Button, Chip, Spinner } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import { usersService } from "../../../../services/users-service";
import { toast } from "sonner";
import { SearchIcon, CalendarIcon } from "../../../utils/icons";
import styles from "./search.module.css";

type Professional = {
  id: string;
  name: string;
  email: string;
  status: string;
  professionalProfile?: {
    id: string;
    specialty: string;
    professionalLicense: string;
    modality?: string;
    bio?: string;
  };
};

const SPECIALTIES = [
  "Todas",
  "Cardiologia",
  "Dermatologia",
  "Clínico Geral",
  "Nutrição",
  "Ortopedia",
  "Pediatria",
  "Psicologia",
  "Psiquiatria",
];

const SearchDoctorsPage = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Todas");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      setIsLoading(true);
      const data = await usersService.getAllProfessionals();
      setProfessionals(data);
    } catch {
      toast.error("Erro ao carregar profissionais.");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = professionals
    .filter((prof) => prof.status !== "PENDING" && prof.status !== "BLOCKED")
    .filter((prof) => {
      const term = search.toLowerCase();
      const matchesSearch =
        prof.name.toLowerCase().includes(term) ||
        (prof.professionalProfile?.specialty || "")
          .toLowerCase()
          .includes(term);

      const matchesSpecialty =
        selectedSpecialty === "Todas" ||
        (prof.professionalProfile?.specialty || "")
          .toLowerCase()
          .includes(selectedSpecialty.toLowerCase());

      return matchesSearch && matchesSpecialty;
    });

  const getModalityLabel = (modality?: string) => {
    switch (modality) {
      case "VIRTUAL":
        return "Online";
      case "HOME_VISIT":
        return "Domiciliar";
      case "CLINIC":
        return "Presencial";
      default:
        return "Online";
    }
  };

  const renderAvatar = (name: string) => {
    return (
      <div className={styles.avatarNoPhoto}>
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Buscar Médicos</h1>
          <p className={styles.subtitle}>
            Encontre profissionais de saúde voluntários e agende sua consulta
            gratuitamente.
          </p>
        </div>
      </div>

      <div className={styles.searchArea}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nome ou especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filtersRow}>
          {SPECIALTIES.map((spec) => (
            <button
              key={spec}
              className={
                selectedSpecialty === spec
                  ? styles.filterChipActive
                  : styles.filterChip
              }
              onClick={() => setSelectedSpecialty(spec)}
            >
              {spec}
            </button>
          ))}
        </div>

        {!isLoading && (
          <p className={styles.resultsInfo}>
            {filtered.length}{" "}
            {filtered.length === 1
              ? "profissional encontrado"
              : "profissionais encontrados"}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <SearchIcon />
          <h3 className={styles.emptyTitle}>
            Nenhum profissional encontrado
          </h3>
          <p className={styles.emptyText}>
            Tente alterar os filtros ou buscar por outro termo.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((prof) => (
            <Card key={prof.id} className={styles.doctorCard}>
              <CardBody className={styles.doctorCardBody}>
                {renderAvatar(prof.name)}

                <div className={styles.doctorInfo}>
                  <h3 className={styles.doctorName}>{prof.name}</h3>
                  <p className={styles.doctorSpecialty}>
                    {prof.professionalProfile?.specialty || "Especialidade não informada"}
                  </p>
                  {prof.professionalProfile?.professionalLicense && (
                    <p className={styles.doctorLicense}>
                      CRM: {prof.professionalProfile.professionalLicense}
                    </p>
                  )}

                  <div className={styles.doctorMeta}>
                    <Chip
                      size="sm"
                      variant="soft"
                      color="accent"
                      className={styles.modalityChip}
                    >
                      {getModalityLabel(prof.professionalProfile?.modality)}
                    </Chip>
                    {prof.status === "VERIFIED" && (
                      <>
                        <span className={styles.statusDot}></span>
                        <span className={styles.statusText}>Verificado</span>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <Button size="sm" className={styles.scheduleButton}>
                    <CalendarIcon />
                    Agendar
                  </Button>
                  <Button size="sm" className={styles.profileButton}>
                    Ver Perfil
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default SearchDoctorsPage;
