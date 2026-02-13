"use client";

import React from "react";
import { Button, Chip } from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import styles from "./professional-dashboard.module.css";
import { toast } from "sonner";
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  UsersIcon,
  XIcon,
  VideoIcon,
} from "../../utils/icons";

const ProfessionalDashboard = () => {
  const stats = [
    {
      title: "Consultas Hoje",
      value: "8",
      icon: <CalendarIcon />,
      color: "primary",
    },
    { title: "Pendentes", value: "3", icon: <ClockIcon />, color: "warning" },
    {
      title: "Total Pacientes",
      value: "142",
      icon: <UsersIcon />,
      color: "success",
    },
  ];

  const nextAppointment = {
    patientName: "Lucas Mendes",
    time: "14:00 - 15:00",
    type: "VIRTUAL",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    status: "CONFIRMED",
  };

  const schedule = [
    {
      time: "09:00",
      name: "Maria Clara",
      status: "COMPLETED",
      type: "Retorno",
    },
    {
      time: "10:00",
      name: "João Pedro",
      status: "COMPLETED",
      type: "Primeira Vez",
    },
    {
      time: "14:00",
      name: "Lucas Mendes",
      status: "UPCOMING",
      type: "Retorno",
    },
    {
      time: "15:30",
      name: "Fernanda Lima",
      status: "UPCOMING",
      type: "Exames",
    },
  ];

  const requests = [
    {
      id: 1,
      name: "Ana Souza",
      date: "Hoje, 16:30",
      avatar: "https://i.pravatar.cc/150?u=a04258114e29026708c",
    },
    {
      id: 2,
      name: "Carlos Lima",
      date: "Amanhã, 09:00",
      avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
    },
  ];

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Painel Profissional</h1>
          <p className={styles.subtitle}>
            Gerencie suas consultas e acompanhe seu dia.
          </p>
        </div>
        <Button className={styles.calendarButton}>
          <CalendarIcon />
          Minha Agenda
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
              <span className={styles.pulseDot}></span> Próximo Atendimento
            </h2>
          </div>
          <Card className={styles.nextApptCard}>
            <CardBody className={styles.nextApptBody}>
              <div className="flex items-center gap-4">
                <div>
                  <h3 className={styles.nextApptName}>
                    {nextAppointment.patientName}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500 mt-1">
                    <Chip size="sm" className={styles.modalityChip}>
                      Consulta Online
                    </Chip>
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <ClockIcon /> {nextAppointment.time}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.actions}>
                <Button className={styles.actionButton}>Ver Prontuário</Button>
                <Button className={styles.actionButton}>
                  <VideoIcon />
                  Iniciar Vídeo
                </Button>
              </div>
            </CardBody>
          </Card>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Agenda de Hoje</h2>
          </div>
          <Card className={styles.scheduleCard}>
            <CardBody>
              {schedule.map((item, idx) => (
                <div key={idx} className={styles.scheduleRow}>
                  <div className={styles.timeSlot}>{item.time}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.type}</p>
                  </div>
                  <Chip
                    size="sm"
                    className={styles.statusChip}
                    color={item.status === "COMPLETED" ? "success" : "default"}
                  >
                    {item.status === "COMPLETED" ? "Realizado" : "Agendado"}
                  </Chip>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Solicitações</h2>
            <Chip size="sm" color="warning" className={styles.statusChip}>
              2 Novas
            </Chip>
          </div>

          <div className="flex flex-col gap-3">
            {requests.map((req) => (
              <Card key={req.id} className="border-none shadow-sm">
                <CardBody className={styles.requestCardBody}>
                  <div>
                    <p className="font-semibold text-gray-800">{req.name}</p>
                    <p className="text-xs text-gray-500">{req.date}</p>
                  </div>
                  <div className={styles.requestActions}>
                    <Button
                      size="sm"
                      className={styles.approveButton}
                      onPress={() => toast.success("Agendamento aprovado")}
                    >
                      <CheckIcon />
                      Aceitar
                    </Button>
                    <Button size="sm" className={styles.rejectButton}>
                      <XIcon />
                      Recusar
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          <Card className={styles.tipCard}>
            <CardBody>
              <h4 className={styles.tipTitle}>Dica do Sistema</h4>
              <p className={styles.tipText}>
                Mantenha sua agenda atualizada para evitar conflitos de horário.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalDashboard;
