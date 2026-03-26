"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Chip, ChipProps, Spinner } from "@heroui/react";
import { Divider } from "@heroui/divider";
import { Card, CardBody } from "@heroui/card";
import { DayPicker } from "react-day-picker";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import styles from "./schedule.module.css";
import { toast } from "sonner";
import { MoreVerticalIcon } from "../../../utils/icons";
import Image from "next/image";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import ScheduleModal from "./scheduleModal";
import { useDailyScheduleQuery } from "../../../../queries/useDailyScheduleQuery";

type Appointment = {
  id: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  notes?: string;
  patient: {
    name: string;
  };
};

const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "success";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
      case "NO_SHOW":
        return "danger";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
};

const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmado";
      case "COMPLETED":
        return "Realizado";
      case "CANCELLED":
        return "Cancelado";
      case "NO_SHOW":
        return "Faltou";
      case "PENDING":
        return "Pendente";
      default:
        return status;
    }
};

const SchedulePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onOpenChange = (open: boolean) => setIsOpen(open);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const dateStr = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : "";

  const {
    data: scheduleData,
    isLoading,
    isError,
  } = useDailyScheduleQuery(dateStr);

  useEffect(() => {
    if (isError) {
      toast.error("Erro ao carregar a agenda do dia.");
    }
  }, [isError]);

  const { appointments, timeSlots, isAvailableToday } = useMemo(() => {
    if (!scheduleData) {
      return {
        appointments: [] as Appointment[],
        timeSlots: [] as string[],
        isAvailableToday: true,
      };
    }

    const appts = scheduleData.appointments as Appointment[];

    if (!scheduleData.availability) {
      return {
        appointments: appts,
        timeSlots: [] as string[],
        isAvailableToday: false,
      };
    }

    const startHour = parseInt(
      scheduleData.availability.startTime.split(":")[0],
      10,
    );
    const endHour = parseInt(
      scheduleData.availability.endTime.split(":")[0],
      10,
    );
    const slots: string[] = [];
    for (let i = startHour; i < endHour; i++) {
      slots.push(`${i.toString().padStart(2, "0")}:00`);
    }

    return {
      appointments: appts,
      timeSlots: slots,
      isAvailableToday: true,
    };
  }, [scheduleData]);

  const getAppointmentForSlot = (slotTime: string) => {
    if (!selectedDate) return undefined;

    return appointments.find((apt) => {
      const aptDate = new Date(apt.dateTime);
      const isSameDayMatch = isSameDay(aptDate, selectedDate);
      const aptHourStr =
        aptDate.getUTCHours().toString().padStart(2, "0") + ":00";
      return isSameDayMatch && aptHourStr === slotTime;
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

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Minha Agenda</h1>
          <p className={styles.subtitle}>Visualize e gerencie seus horários.</p>
        </div>
        <div className="flex gap-3">
          <Button
            className={styles.addButton}
            onPress={onOpen}
            variant="primary"
          >
            Gerenciar Horários
          </Button>
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
            {isAvailableToday && (
              <Chip className={styles.dayOfAttendanceChip}>
                Dia de Atendimento
              </Chip>
            )}
          </div>

          <div className={styles.timeline}>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner size="lg" />
              </div>
            ) : !isAvailableToday ? (
              <div className="text-center py-10 text-gray-500">
                Você não possui expediente configurado para este dia da semana.
              </div>
            ) : (
              timeSlots.map((slot) => {
                const appointment = getAppointmentForSlot(slot);

                return (
                  <div key={slot} className={styles.timeRow}>
                    <div className={styles.timeLabel}>{slot}</div>

                    <div className={styles.slotContent}>
                      {appointment ? (
                        <Card
                          className={`${styles.appointmentCard} ${
                            styles[appointment.status.toLowerCase()]
                          }`}
                        >
                          <CardBody className="flex flex-row items-center gap-4 p-3">
                            <div className={styles.apptTime}>
                              <span className="font-bold text-gray-800">
                                {slot}
                              </span>
                            </div>

                            <Divider orientation="vertical" className="h-8" />

                            <div className="flex items-center gap-3 flex-1">
                              {renderAvatar(appointment.patient.name)}
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
                                    {getStatusText(appointment.status)}
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
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
      <ScheduleModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </section>
  );
};

export default SchedulePage;
