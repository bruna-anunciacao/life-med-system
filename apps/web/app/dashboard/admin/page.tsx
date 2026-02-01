"use client";

import { User } from "../../../services/auth-service";
import { usersService } from "../../../services/users-service";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { useCallback, useEffect, useState } from "react";
import { Chip, Spinner, Tooltip, type ChipProps, Button } from "@heroui/react";
import { toast } from "sonner";
import React from "react";
import styles from "./admin-dashboard.module.css";
import { EyeIcon, CheckIcon, BanIcon, EditIcon } from "../../utils/icons";

const columns = [
  { name: "USUÁRIOS", uid: "name" },
  { name: "STATUS", uid: "status" },
  { name: "AÇÕES", uid: "actions" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
  VERIFIED: "success",
  BLOCKED: "danger",
  PENDING: "warning",
  COMPLETE: "default",
};

const statusTextMap: Record<string, string> = {
  VERIFIED: "Verificado",
  BLOCKED: "Bloqueado",
  PENDING: "Pendente",
  COMPLETED: "Cadastro Completo",
};

const AdminDashboard = () => {
  const [patients, setPatients] = useState<User[]>([]);
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const handleStatusChange = async (
    userId: string,
    newStatus: "VERIFIED" | "BLOCKED",
    role: string,
  ) => {
    try {
      await usersService.updateUserStatus(userId, newStatus);
      toast.success(`Status atualizado para ${statusTextMap[newStatus]}`);

      const updateList = (list: User[]) =>
        list.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));

      if (role === "PROFESSIONAL") {
        setProfessionals((prev) => updateList(prev));
      } else {
        setPatients((prev) => updateList(prev));
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientsData, professionalsData] = await Promise.all([
        usersService.getAllPatients(),
        usersService.getAllProfessionals(),
      ]);

      setPatients(patientsData);
      setProfessionals(professionalsData);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao carregar dados do sistema.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderCell = useCallback((user: User, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof User];

    switch (columnKey) {
      case "name":
        return (
          <div className={styles.nameContainer}>
            <p className={styles.userName}>{user.name}</p>
            <p className={styles.userEmail}>{user.email}</p>
          </div>
        )
      case "status":
        return (
          <div className={styles.statusBtnContainer}>
            <Chip
              className={styles.statusBtn}
              color={statusColorMap[user.status] || "default"}
              size="sm"
            >
              {statusTextMap[user.status] || user.status}
            </Chip>
          </div>
        );
      case "actions":
        return (
          <div className={styles.actions}>
            <Tooltip>
              <Button className={`${styles.actionBtn} ${styles.iconDefault}`}>
                <EyeIcon />
              </Button>
            </Tooltip>

            {user.status === "COMPLETED" && (
              <Tooltip>
                <Button
                  className={`${styles.actionBtn} ${styles.iconSuccess}`}
                  onClick={() =>
                    handleStatusChange(user.id, "VERIFIED", user.role)
                  }
                >
                  <CheckIcon />
                </Button>
              </Tooltip>
            )}

            {user.status === "VERIFIED" && (
              <Tooltip>
                <Button
                  className={`${styles.actionBtn} ${styles.iconDanger}`}
                  onClick={() =>
                    handleStatusChange(user.id, "BLOCKED", user.role)
                  }
                >
                  <BanIcon />
                </Button>
              </Tooltip>
            )}

            {user.status === "BLOCKED" && (
              <Tooltip>
                <Button
                  className={`${styles.actionBtn} ${styles.iconWarning}`}
                  onClick={() =>
                    handleStatusChange(user.id, "VERIFIED", user.role)
                  }
                >
                  <CheckIcon />
                </Button>
              </Tooltip>
            )}

            <Tooltip>
              <Button className={`${styles.actionBtn} ${styles.iconDefault}`}>
                <EditIcon />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Painel Administrativo</h1>
        <p className={styles.subtitle}>
          Gerencie permissões e visualize usuários do sistema.
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Pacientes{" "}
            <span className={styles.countBadge}>{patients.length}</span>
          </h2>
        </div>
        <Table aria-label="Tabela de Pacientes" >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                className={styles.textTable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={patients}
            emptyContent={"Nenhum paciente encontrado."}
          >
            {(item) => (
              <TableRow key={item.id || item.email} className={styles.textTable}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Profissionais{" "}
            <span className={styles.countBadge}>{professionals.length}</span>
          </h2>
        </div>

        <Table aria-label="Tabela de Profissionais">
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                className={styles.textTable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={professionals}
            emptyContent={"Nenhum profissional encontrado."}
          >
            {(item) => (
              <TableRow key={item.id || item.email} className={styles.textTable}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default AdminDashboard;
