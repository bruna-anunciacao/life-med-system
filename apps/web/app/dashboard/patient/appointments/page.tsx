"use client";

import React, { useState } from "react";
import { Button, Chip } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarIcon,
  ClockIcon,
  SearchIcon,
} from "../../../utils/icons";
import styles from "./appointments.module.css";

type Appointment = {
  id: string;
  doctorName: string;
  specialty: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  modality: "VIRTUAL" | "CLINIC" | "HOME_VISIT";
  notes?: string;
};

const TABS = [
  { key: "upcoming", label: "Próximas" },
  { key: "past", label: "Realizadas" },
  { key: "cancelled", label: "Canceladas" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const AppointmentsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      doctorName: "Dra. Ana Paula",
      specialty: "Cardiologista",
      dateTime: "2026-02-24T14:00:00.000Z",
      status: "CONFIRMED",
      modality: "VIRTUAL",
    },
    {
      id: "2",
      doctorName: "Dr. Carlos Lima",
      specialty: "Dermatologista",
      dateTime: "2026-02-26T09:00:00.000Z",
      status: "PENDING",
      modality: "CLINIC",
    },
    {
      id: "3",
      doctorName: "Dra. Fernanda Souza",
      specialty: "Nutricionista",
      dateTime: "2026-03-02T10:30:00.000Z",
      status: "CONFIRMED",
      modality: "VIRTUAL",
    },
    {
      id: "4",
      doctorName: "Dr. João Silva",
      specialty: "Clínico Geral",
      dateTime: "2026-02-10T08:00:00.000Z",
      status: "COMPLETED",
      modality: "CLINIC",
      notes: "Retorno em 30 dias. Exames solicitados.",
    },
    {
      id: "5",
      doctorName: "Dra. Maria Clara",
      specialty: "Psicóloga",
      dateTime: "2026-01-28T15:00:00.000Z",
      status: "COMPLETED",
      modality: "VIRTUAL",
      notes: "Acompanhamento semanal mantido.",
    },
    {
      id: "6",
      doctorName: "Dr. Pedro Santos",
      specialty: "Ortopedista",
      dateTime: "2026-02-05T11:00:00.000Z",
      status: "CANCELLED",
      modality: "CLINIC",
    },
  ]);

  const getFilteredAppointments = () => {
    switch (activeTab) {
      case "upcoming":
        return appointments.filter(
          (a) => a.status === "CONFIRMED" || a.status === "PENDING"
        );
      case "past":
        return appointments.filter((a) => a.status === "COMPLETED");
      case "cancelled":
        return appointments.filter((a) => a.status === "CANCELLED");
    }
  };

  const getTabCount = (tab: TabKey) => {
    switch (tab) {
      case "upcoming":
        return appointments.filter(
          (a) => a.status === "CONFIRMED" || a.status === "PENDING"
        ).length;
      case "past":
        return appointments.filter((a) => a.status === "COMPLETED").length;
      case "cancelled":
        return appointments.filter((a) => a.status === "CANCELLED").length;
    }
  };

  const handleCancel = (id: string) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja cancelar esta consulta?"
    );
    if (!confirmed) return;

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" as const } : a))
    );
    toast.success("Consulta cancelada com sucesso.");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date
        .toLocaleString("pt-BR", { month: "short" })
        .replace(".", ""),
      year: date.getFullYear().toString(),
    };
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmada";
      case "PENDING":
        return "Pendente";
      case "COMPLETED":
        return "Realizada";
      case "CANCELLED":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "accent" as const;
      case "PENDING":
        return "warning" as const;
      case "COMPLETED":
        return "success" as const;
      case "CANCELLED":
        return "danger" as const;
      default:
        return "default" as const;
    }
  };

  const getModalityLabel = (modality: string) => {
    switch (modality) {
      case "VIRTUAL":
        return "Online";
      case "HOME_VISIT":
        return "Domiciliar";
      case "CLINIC":
        return "Presencial";
      default:
        return modality;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return styles.confirmed;
      case "PENDING":
        return styles.pending;
      case "COMPLETED":
        return styles.completed;
      case "CANCELLED":
        return styles.cancelled;
      default:
        return "";
    }
  };

  const filtered = getFilteredAppointments().sort((a, b) => {
    const dateA = new Date(a.dateTime).getTime();
    const dateB = new Date(b.dateTime).getTime();
    return activeTab === "past" ? dateB - dateA : dateA - dateB;
  });

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Minhas Consultas</h1>
          <p className={styles.subtitle}>
            Acompanhe e gerencie suas consultas agendadas.
          </p>
        </div>
        <Button
          className={styles.searchButton}
          onPress={() => router.push("/dashboard/patient/search")}
        >
          <SearchIcon />
          Nova Consulta
        </Button>
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={
              activeTab === tab.key ? styles.tabActive : styles.tab
            }
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className={styles.tabCount}>{getTabCount(tab.key)}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <CalendarIcon />
          <h3 className={styles.emptyTitle}>
            {activeTab === "upcoming"
              ? "Nenhuma consulta agendada"
              : activeTab === "past"
                ? "Nenhuma consulta realizada"
                : "Nenhuma consulta cancelada"}
          </h3>
          <p className={styles.emptyText}>
            {activeTab === "upcoming"
              ? "Busque um profissional para agendar sua consulta."
              : "Suas consultas aparecerão aqui."}
          </p>
          {activeTab === "upcoming" && (
            <Button
              className={styles.emptyButton}
              onPress={() => router.push("/dashboard/patient/search")}
            >
              Buscar Médicos
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((appt) => {
            const { day, month, year } = formatDate(appt.dateTime);

            return (
              <Card
                key={appt.id}
                className={`${styles.appointmentCard} ${getStatusClass(appt.status)}`}
              >
                <CardBody className={`${styles.cardBody} !flex-row !items-center`}>
                  <div className={styles.dateBadge}>
                    <span className={styles.dateDay}>{day}</span>
                    <span className={styles.dateMonth}>{month}</span>
                    <span className={styles.dateYear}>{year}</span>
                  </div>

                  <div className={styles.info}>
                    <h3 className={styles.doctorName}>{appt.doctorName}</h3>
                    <p className={styles.specialty}>{appt.specialty}</p>
                    <div className={styles.meta}>
                      <span className={styles.timeText}>
                        <ClockIcon /> {formatTime(appt.dateTime)}
                      </span>
                      <Chip size="sm" className={styles.modalityChip}>
                        {getModalityLabel(appt.modality)}
                      </Chip>
                      <Chip
                        size="sm"
                        color={getStatusColor(appt.status)}
                        className={styles.statusChip}
                      >
                        {getStatusLabel(appt.status)}
                      </Chip>
                    </div>
                    {appt.notes && (
                      <div className={styles.notesRow}>
                        <p className={styles.notesText}>
                          Obs: {appt.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    {(appt.status === "CONFIRMED" ||
                      appt.status === "PENDING") && (
                      <>
                        <Button
                          size="sm"
                          className={styles.detailsButton}
                        >
                          Detalhes
                        </Button>
                        <Button
                          size="sm"
                          className={styles.cancelButton}
                          onPress={() => handleCancel(appt.id)}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                    {appt.status === "COMPLETED" && (
                      <Button
                        size="sm"
                        className={styles.detailsButton}
                      >
                        Ver Detalhes
                      </Button>
                    )}
                    {appt.status === "CANCELLED" && (
                      <Button
                        size="sm"
                        className={styles.rebookButton}
                        onPress={() =>
                          router.push("/dashboard/patient/search")
                        }
                      >
                        Reagendar
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default AppointmentsPage;
