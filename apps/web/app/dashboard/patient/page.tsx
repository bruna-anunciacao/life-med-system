"use client";

import React, { useEffect, useState } from "react";
import { Button, Chip } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import { useRouter } from "next/navigation";
import styles from "./patient-dashboard.module.css";
import { usersService } from "../../../services/users-service";
import {
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  SearchIcon,
} from "../../utils/icons";

const PatientDashboard = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    usersService
      .getUser()
      .then((data) => setUserName(data.name?.split(" ")[0] || ""))
      .catch(() => {});
  }, []);

  const stats = [
    {
      title: "Próximas Consultas",
      value: "2",
      icon: <CalendarIcon />,
      color: "primary",
    },
    {
      title: "Aguardando Confirmação",
      value: "1",
      icon: <ClockIcon />,
      color: "warning",
    },
    {
      title: "Consultas Realizadas",
      value: "5",
      icon: <CheckIcon />,
      color: "success",
    },
  ];

  const nextAppointment = {
    doctorName: "Dra. Ana Paula",
    specialty: "Cardiologista",
    time: "14:00 - 15:00",
    date: "24 de Fevereiro",
    type: "VIRTUAL",
    status: "CONFIRMED",
  };

  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Carlos Lima",
      specialty: "Dermatologista",
      day: "26",
      month: "Fev",
      time: "09:00",
      status: "CONFIRMED",
    },
    {
      id: 2,
      doctor: "Dra. Fernanda Souza",
      specialty: "Nutricionista",
      day: "02",
      month: "Mar",
      time: "10:30",
      status: "PENDING",
    },
  ];

  const suggestedDoctors = [
    {
      id: 1,
      name: "Dr. João Silva",
      specialty: "Clínico Geral",
    },
    {
      id: 2,
      name: "Dra. Maria Clara",
      specialty: "Psicóloga",
    },
    {
      id: 3,
      name: "Dr. Pedro Santos",
      specialty: "Ortopedista",
    },
  ];

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {userName ? `Olá, ${userName}!` : "Painel do Paciente"}
          </h1>
          <p className={styles.subtitle}>
            Acompanhe suas consultas e encontre profissionais de saúde.
          </p>
        </div>
        <Button
          className={styles.searchButton}
          onPress={() => router.push("/dashboard/patient/search")}
        >
          <SearchIcon />
          Buscar Médicos
        </Button>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <Card key={index} className={styles.statCard}>
            <CardBody className={styles.statCardBody}>
              <div>
                <p className={styles.statTitle}>{stat.title}</p>
                <h3 className={styles.statValue}>{stat.value}</h3>
              </div>
              <div className={`${styles.iconWrapper} ${styles[stat.color]}`}>
                {stat.icon}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.pulseDot}></span> Próxima Consulta
            </h2>
          </div>
          <Card className={styles.nextApptCard}>
            <CardBody className={styles.nextApptBody}>
              <div className="flex items-center gap-4">
                <div>
                  <h3 className={styles.nextApptName}>
                    {nextAppointment.doctorName}
                  </h3>
                  <p className={styles.nextApptSpecialty}>
                    {nextAppointment.specialty}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Chip size="sm" className={styles.modalityChip}>
                      {nextAppointment.type === "VIRTUAL"
                        ? "Consulta Online"
                        : "Presencial"}
                    </Chip>
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-500">
                      <ClockIcon /> {nextAppointment.date} • {nextAppointment.time}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.actions}>
                <Button className={styles.actionButton}>Ver Detalhes</Button>
                <Button className={styles.cancelButton}>Cancelar</Button>
              </div>
            </CardBody>
          </Card>

          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Próximas Consultas</h2>
            <Button
              size="sm"
              variant="ghost"
              onPress={() => router.push("/dashboard/patient/appointments")}
            >
              Ver Todas
            </Button>
          </div>
          <Card className={styles.appointmentsCard}>
            <CardBody>
              {upcomingAppointments.map((appt) => (
                <div key={appt.id} className={styles.appointmentRow}>
                  <div className={styles.dateSlot}>
                    <p className={styles.dateDay}>{appt.day}</p>
                    <p className={styles.dateMonth}>{appt.month}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{appt.doctor}</p>
                    <p className="text-xs text-gray-500">{appt.specialty}</p>
                    <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <ClockIcon /> {appt.time}
                    </span>
                  </div>
                  <Chip
                    size="sm"
                    className={styles.statusChip}
                    color={appt.status === "CONFIRMED" ? "success" : "warning"}
                  >
                    {appt.status === "CONFIRMED" ? "Confirmada" : "Pendente"}
                  </Chip>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Profissionais Disponíveis</h2>
          </div>

          <div className="flex flex-col gap-3">
            {suggestedDoctors.map((doc) => (
              <Card key={doc.id} className={styles.doctorCard}>
                <CardBody className={styles.doctorCardBody}>
                  <div className={styles.avatarNoPhoto}>
                    {doc.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className={styles.doctorName}>{doc.name}</p>
                    <p className={styles.doctorSpecialty}>{doc.specialty}</p>
                  </div>
                  <Button
                    size="sm"
                    className={styles.viewProfileButton}
                    onPress={() => router.push("/dashboard/patient/search")}
                  >
                    Agendar
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>

          <Card className={styles.tipCard}>
            <CardBody>
              <h4 className={styles.tipTitle}>Dica de Saúde</h4>
              <p className={styles.tipText}>
                Mantenha suas consultas em dia e não esqueça de verificar a
                disponibilidade dos profissionais regularmente.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PatientDashboard;