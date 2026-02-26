"use client";

import React, { useEffect, useState } from "react";
import { Button, Chip, ChipProps } from "@heroui/react";
import { Divider } from "@heroui/divider";
import { Card, CardBody } from "@heroui/card";
import { DayPicker } from "react-day-picker";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import styles from "./schedule.module.css";
import { toast } from "sonner";
import { MoreVerticalIcon, PlusIcon } from "../../../utils/icons";
import Image from "next/image";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

type Appointment = {
  id: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELED" | "COMPLETED" | "NO_SHOW";
  notes?: string;
  patient: {
    name: string;
  };
  type?: "VIRTUAL" | "CLINIC" | "HOME_VISIT";
};

const SchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  useEffect(() => {
    const baseDate = selectedDate || new Date();

    const date9AM = new Date(baseDate.setHours(9, 0, 0, 0)).toISOString();
    const date2PM = new Date(baseDate.setHours(14, 0, 0, 0)).toISOString();

    const mockDataFromPrisma: Appointment[] = [
      {
        id: "uuid-1",
        dateTime: date9AM,
        status: "COMPLETED",
        patient: {
          name: "Maria Clara",
        },
        type: "CLINIC",
      },
      {
        id: "uuid-2",
        dateTime: date2PM,
        status: "PENDING",
        patient: { name: "Lucas Mendes" },
        type: "VIRTUAL",
      },
      {
        id: "uuid-3",
        dateTime: new Date(
          new Date().setDate(new Date().getDate() + 1),
        ).toISOString(),
        status: "CONFIRMED",
        patient: { name: "Aparece só amanha" },
      },
    ];
    setAppointments(mockDataFromPrisma);
  }, [selectedDate]);

  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const getAppointmentForSlot = (slotTime: string) => {
    if (!selectedDate) return undefined;

    return appointments.find((apt) => {
      const aptDate = new Date(apt.dateTime);

      const isSameDayMatch = isSameDay(aptDate, selectedDate);

      const aptHourStr = aptDate.getHours().toString().padStart(2, "0") + ":00";
      const isTimeMatch = aptHourStr === slotTime;

      return isSameDayMatch && isTimeMatch;
    });
  };

  const renderAvatar = (name: string, photoUrl?: string) => {
    if (photoUrl && photoUrl.trim() !== "") {
      return (
        <Image
          alt={name}
          src={photoUrl}
          width={40}
          height={40}
          className={styles.avatar}
        />
      );
    }
    return (
      <div className={styles.avatarNoPhoto}>{name.charAt(0).toUpperCase()}</div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "primary";
      case "COMPLETED":
        return "success";
      case "CANCELED":
        return "danger";
      case "NO_SHOW":
        return "danger";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Minha Agenda</h1>
          <p className={styles.subtitle}>Visualize e gerencie seus horários.</p>
        </div>
        <div className="flex gap-3">
          <Button className={styles.addButton}>Gerenciar Horários</Button>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebar}>
          <div className={styles.calendarCard}>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
            />
          </div>
        </aside>

        <main className={styles.timelineArea}>
          <div className={styles.dateHeader}>
            <h2 className={styles.currentDateTitle}>
              {selectedDate &&
                format(selectedDate, "EEEE, d 'de' MMMM", {
                  locale: ptBR,
                })}
            </h2>
            <Chip className={styles.dayOfAttendanceChip}>
              Dia de Atendimento
            </Chip>
          </div>

          <div className={styles.timeline}>
            {timeSlots.map((slot) => {
              const appointment = getAppointmentForSlot(slot);

              return (
                <div key={slot} className={styles.timeRow}>
                  <div className={styles.timeLabel}>{slot}</div>

                  <div className={styles.slotContent}>
                    {appointment ? (
                      <Card
                        className={`${styles.appointmentCard} ${styles[appointment.status.toLowerCase()]}`}
                      >
                        <CardBody className="flex flex-row items-center gap-4 p-3">
                          <div className={styles.apptTime}>
                            <span className="font-bold text-gray-800">
                              {slot}
                            </span>
                          </div>

                          <Divider orientation="vertical" className="h-8" />

                          <div className="flex items-center gap-3 flex-1">
                            {renderAvatar(
                              appointment.patient.name,
                            )}
                            <div>
                              <p className="font-semibold text-sm text-gray-900">
                                {appointment.patient.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <Chip
                                  size="sm"
                                  variant="soft"
                                  color={
                                    getStatusColor(
                                      appointment.status,
                                    ) as ChipProps["color"]
                                  }
                                  className={styles.modalityChip}
                                >
                                  {appointment.type === "VIRTUAL"
                                    ? "Online"
                                    : "Presencial"}
                                </Chip>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Dropdown>
                              <DropdownTrigger>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="ghost"
                                  className="text-gray-400"
                                >
                                  <MoreVerticalIcon />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                aria-label="Static Actions"
                                className={styles.dropdown}
                              >
                                {appointment.status === "PENDING" ? (
                                  <>
                                    <DropdownItem key="CONFIRMED">
                                      Confirmar
                                    </DropdownItem>
                                    <DropdownItem key="CANCELLED">
                                      Cancelar
                                    </DropdownItem>
                                  </>
                                ) : (
                                  <>
                                    <DropdownItem key="COMPLETED">
                                      Realizado
                                    </DropdownItem>
                                    <DropdownItem key="NO_SHOW">
                                      Não Compareceu
                                    </DropdownItem>
                                  </>
                                )}
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </CardBody>
                      </Card>
                    ) : (
                      <div className={styles.emptySlot}>
                        <span className="text-gray-400 text-sm">
                          Disponível
                        </span>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="ghost"
                              className="text-gray-400"
                            >
                              <MoreVerticalIcon />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Static Actions"
                            className={styles.dropdown}
                          >
                            <DropdownItem key="">Retirar Slot</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </section>
  );
};

export default SchedulePage;
