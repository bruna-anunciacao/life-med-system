"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { EyeIcon, CheckIcon, BanIcon, EditIcon } from "../../../utils/icons";
import { User } from "../../../../services/auth-service";
import styles from "../admin-dashboard.module.css";

const statusVariantMap: Record<string, string> = {
  VERIFIED: "bg-green-100 text-green-700",
  BLOCKED: "bg-red-100 text-red-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETE: "bg-gray-100 text-gray-700",
};

const statusTextMap: Record<string, string> = {
  VERIFIED: "Verificado",
  BLOCKED: "Bloqueado",
  PENDING: "Pendente",
  COMPLETED: "Completo",
};

type UsersTableProps = {
  users: User[];
  listType: "patient" | "professional";
  title: string;
  emptyMessage: string;
  onStatusChange: (userId: string, newStatus: "VERIFIED" | "BLOCKED", listType: "patient" | "professional") => void;
};

export function UsersTable({ users, listType, title, emptyMessage, onStatusChange }: UsersTableProps) {
  const router = useRouter();

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {title} <span className={styles.countBadge}>{users.length}</span>
        </h2>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>USUÁRIOS</th>
              <th style={{ textAlign: "center" }}>STATUS</th>
              <th style={{ textAlign: "center" }}>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <div className={styles.empty}>{emptyMessage}</div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.nameContainer}>
                      <p className={styles.userName}>{user.name}</p>
                      <p className={styles.userEmail}>{user.email}</p>
                    </div>
                  </td>

                  <td className={styles.alignCenter}>
                    <div className={styles.statusBtnContainer}>
                      <Badge
                        className={`${styles.statusBtn} ${statusVariantMap[user.status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {statusTextMap[user.status] ?? user.status}
                      </Badge>
                    </div>
                  </td>

                  <td className={styles.alignCenter}>
                    <div className={styles.actions}>
                      <Button
                        className={`${styles.actionBtn} ${styles.iconDefault}`}
                        onClick={() => router.push(`/dashboard/admin/users/${user.id}`)}
                      >
                        <EyeIcon />
                      </Button>

                      {user.status === "COMPLETED" && (
                        <Button
                          className={`${styles.actionBtn} ${styles.iconSuccess}`}
                          onClick={() => onStatusChange(user.id, "VERIFIED", listType)}
                        >
                          <CheckIcon />
                        </Button>
                      )}

                      {user.status === "VERIFIED" && (
                        <Button
                          className={`${styles.actionBtn} ${styles.iconDanger}`}
                          onClick={() => onStatusChange(user.id, "BLOCKED", listType)}
                        >
                          <BanIcon />
                        </Button>
                      )}

                      {user.status === "BLOCKED" && (
                        <Button
                          className={`${styles.actionBtn} ${styles.iconWarning}`}
                          onClick={() => onStatusChange(user.id, "VERIFIED", listType)}
                        >
                          <CheckIcon />
                        </Button>
                      )}

                      <Button
                        className={`${styles.actionBtn} ${styles.iconDefault}`}
                        onClick={() => router.push(`/dashboard/admin/users/${user.id}?edit=1`)}
                      >
                        <EditIcon />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
