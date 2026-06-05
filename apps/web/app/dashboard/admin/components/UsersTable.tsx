"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  DataTable,
  DataTableBody,
  DataTableCard,
  DataTableCell,
  DataTableEmpty,
  DataTableHead,
  DataTableHeadCell,
  DataTableHeader,
  DataTableLoading,
  DataTableMobileItem,
  DataTableMobileList,
  DataTableRow,
  DataTableToolbar,
  SortableHeader,
} from "@/components/ui/data-table";
import { AdminUser } from "../../../../services/admin-service";
import { useAdminUsersTable, TypeFilter } from "@/queries/useAdminUsersTable";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Eye, Check, Ban, Pencil, Users } from "lucide-react";

type SortField =
  | "name"
  | "type"
  | "speciality"
  | "status"
  | "createdAt"
  | "phone"
  | "dateOfBirth"
  | "modality";
type SortDir = "asc" | "desc";

const TYPE_TABS: { label: string; value: TypeFilter }[] = [
  { label: "Todos", value: "all" },
  { label: "Pacientes", value: "PATIENT" },
  { label: "Profissionais", value: "PROFESSIONAL" },
  { label: "Gestores", value: "MANAGER" },
];

const TYPE_BADGE: Record<"PATIENT" | "PROFESSIONAL" | "MANAGER", { label: string; className: string }> = {
  PATIENT: { label: "Paciente", className: "bg-blue-50 text-blue-600 border border-blue-200" },
  PROFESSIONAL: { label: "Profissional", className: "bg-violet-50 text-violet-600 border border-violet-200" },
  MANAGER: { label: "Gestor", className: "bg-amber-50 text-amber-700 border border-amber-200" },
};

type Props = {
  onStatusChange: (userId: string, newStatus: "VERIFIED" | "BLOCKED") => void;
  actions?: React.ReactNode;
};

export function UsersTable(props: Props) {
  return (
    <Suspense>
      <UsersTableInner {...props} />
    </Suspense>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getSpeciality(user: AdminUser) {
  if (user.role !== "PROFESSIONAL") return null;
  const list = user.professionalProfile?.specialities;
  if (!list?.length) return null;
  return list.map((s) => s.name).join(", ");
}

function UsersTableInner({ onStatusChange, actions }: Props) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { users, isLoading, search, setSearch, typeFilter, setTypeFilter } = useAdminUsersTable();

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function getSortValue(u: AdminUser, field: SortField): string {
    switch (field) {
      case "name":
        return u.name ?? "";
      case "status":
        return u.status ?? "";
      case "type":
        return TYPE_BADGE[u.role]?.label ?? u.role ?? "";
      case "speciality":
        return getSpeciality(u) ?? "";
      case "createdAt":
        return u.createdAt ?? "";
      case "phone":
        return u.patientProfile?.phone ?? "";
      case "dateOfBirth":
        return u.patientProfile?.dateOfBirth ?? "";
      case "modality":
        return u.professionalProfile?.modality ?? "";
    }
  }

  function goToEdit(userId: string) {
    router.push(`/dashboard/admin/users/${userId}?edit=1`);
  }

  function formatDate(dateString?: string) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("pt-BR");
  }

  const sortedUsers = useMemo(() => {
    if (!sortField) return users;
    return [...users].sort((a, b) => {
      const cmp = getSortValue(a, sortField).localeCompare(getSortValue(b, sortField));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [users, sortField, sortDir]);

  const stopClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <DataTableCard>
      <DataTableHeader title="Usuários" count={sortedUsers.length} actions={actions} />

      <DataTableToolbar>
        <div className="flex rounded-lg border border-border bg-background text-sm overflow-hidden">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              title={`Filtrar por ${tab.label}`}
              className={`px-3 py-1.5 font-medium transition-colors sm:px-4 ${
                typeFilter === tab.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Input
          placeholder="Buscar usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          title="Digite o nome ou e-mail para buscar"
          className="h-8 flex-1 min-w-[160px] max-w-xs text-sm bg-background"
        />
      </DataTableToolbar>

      {isLoading ? (
        <DataTableLoading message="Carregando usuários..." />
      ) : sortedUsers.length === 0 ? (
        <DataTableEmpty
          icon={<Users className="h-8 w-8" />}
          title="Nenhum usuário encontrado"
        />
      ) : isMobile ? (
        <DataTableMobileList>
          {sortedUsers.map((user) => {
            const badge = TYPE_BADGE[user.role];
            const speciality = getSpeciality(user);
            return (
              <DataTableMobileItem
                key={user.id}
                onClick={() => goToEdit(user.id)}
                title={`Abrir perfil de ${user.name}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold">
                    {getInitials(user.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
                    {user.role === "PROFESSIONAL" && speciality && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                        {speciality}
                        {user.professionalProfile?.modality && ` · ${user.professionalProfile.modality}`}
                      </p>
                    )}
                    {user.role === "PATIENT" && user.patientProfile?.phone && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                        Tel: {user.patientProfile.phone}
                      </p>
                    )}
                    {user.createdAt && (
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                        Cadastrado em {formatDate(user.createdAt)}
                      </p>
                    )}
                    <div className="mt-2">
                      <StatusBadge status={user.status} type="user" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5 shrink-0" onClick={stopClick}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title={`Visualizar detalhes de ${user.name}`}
                      onClick={() => router.push(`/dashboard/admin/users/${user.id}`)}
                    >
                      <Eye />
                    </Button>
                    {(user.status === "PENDING" ||
                      user.status === "COMPLETED" ||
                      user.status === "BLOCKED") && (
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={!user.emailVerified}
                        className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                        title={
                          user.emailVerified
                            ? `Aprovar usuário ${user.name}`
                            : `${user.name} ainda não confirmou o e-mail`
                        }
                        onClick={() => onStatusChange(user.id, "VERIFIED")}
                      >
                        <Check />
                      </Button>
                    )}
                    {user.status === "VERIFIED" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50"
                        title={`Bloquear usuário ${user.name}`}
                        onClick={() => onStatusChange(user.id, "BLOCKED")}
                      >
                        <Ban />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title={`Editar dados de ${user.name}`}
                      onClick={() => router.push(`/dashboard/admin/users/${user.id}?edit=1`)}
                    >
                      <Pencil />
                    </Button>
                  </div>
                </div>
              </DataTableMobileItem>
            );
          })}
        </DataTableMobileList>
      ) : (
        <DataTable>
          <DataTableHead>
            <SortableHeader field="name" currentField={sortField} direction={sortDir} onToggle={toggleSort}>
              Usuário
            </SortableHeader>

            {typeFilter === "all" && (
              <SortableHeader field="type" currentField={sortField} direction={sortDir} onToggle={toggleSort} align="center">
                Tipo
              </SortableHeader>
            )}

            {typeFilter === "PATIENT" && (
              <>
                <SortableHeader field="phone" currentField={sortField} direction={sortDir} onToggle={toggleSort} align="center">
                  Telefone
                </SortableHeader>
                <SortableHeader field="dateOfBirth" currentField={sortField} direction={sortDir} onToggle={toggleSort} align="center">
                  Nascimento
                </SortableHeader>
              </>
            )}

            {typeFilter === "PROFESSIONAL" && (
              <>
                <SortableHeader field="speciality" currentField={sortField} direction={sortDir} onToggle={toggleSort} align="center">
                  Especialidade
                </SortableHeader>
                <SortableHeader field="modality" currentField={sortField} direction={sortDir} onToggle={toggleSort} align="center">
                  Modalidade
                </SortableHeader>
              </>
            )}

            <SortableHeader field="status" currentField={sortField} direction={sortDir} onToggle={toggleSort} align="center">
              Status
            </SortableHeader>

            <SortableHeader field="createdAt" currentField={sortField} direction={sortDir} onToggle={toggleSort} align="center">
              Cadastrado em
            </SortableHeader>

            <DataTableHeadCell align="center">Ações</DataTableHeadCell>
          </DataTableHead>
          <DataTableBody>
            {sortedUsers.map((user) => {
              const badge = TYPE_BADGE[user.role];
              const speciality = getSpeciality(user);
              return (
                <DataTableRow
                  key={user.id}
                  onClick={() => goToEdit(user.id)}
                  title={`Abrir perfil de ${user.name}`}
                >
                  <DataTableCell>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                  </DataTableCell>

                  {typeFilter === "all" && (
                    <DataTableCell align="center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    </DataTableCell>
                  )}

                  {typeFilter === "PATIENT" && (
                    <>
                      <DataTableCell align="center">
                        {user.patientProfile?.phone ?? <span className="text-muted-foreground/40">—</span>}
                      </DataTableCell>
                      <DataTableCell align="center">
                        {formatDate(user.patientProfile?.dateOfBirth) ?? <span className="text-muted-foreground/40">—</span>}
                      </DataTableCell>
                    </>
                  )}

                  {typeFilter === "PROFESSIONAL" && (
                    <>
                      <DataTableCell align="center">
                        {speciality ?? <span className="text-muted-foreground/40">—</span>}
                      </DataTableCell>
                      <DataTableCell align="center">
                        {user.professionalProfile?.modality ?? <span className="text-muted-foreground/40">—</span>}
                      </DataTableCell>
                    </>
                  )}

                  <DataTableCell align="center">
                    <StatusBadge status={user.status} type="user" />
                  </DataTableCell>

                  <DataTableCell align="center">
                    {formatDate(user.createdAt) ?? <span className="text-muted-foreground/40">—</span>}
                  </DataTableCell>

                  <DataTableCell align="center" onClick={stopClick}>
                    <div className="flex items-center justify-center gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title={`Visualizar detalhes de ${user.name}`}
                        onClick={() => router.push(`/dashboard/admin/users/${user.id}`)}
                      >
                        <Eye />
                      </Button>

                      {(user.status === "PENDING" ||
                        user.status === "COMPLETED" ||
                        user.status === "BLOCKED") && (
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={!user.emailVerified}
                          className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                          title={
                            user.emailVerified
                              ? `Aprovar usuário ${user.name}`
                              : `${user.name} ainda não confirmou o e-mail`
                          }
                          onClick={() => onStatusChange(user.id, "VERIFIED")}
                        >
                          <Check />
                        </Button>
                      )}

                      {user.status === "VERIFIED" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50"
                          title={`Bloquear usuário ${user.name}`}
                          onClick={() => onStatusChange(user.id, "BLOCKED")}
                        >
                          <Ban />
                        </Button>
                      )}

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title={`Editar dados de ${user.name}`}
                        onClick={() => goToEdit(user.id)}
                      >
                        <Pencil />
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              );
            })}
          </DataTableBody>
        </DataTable>
      )}
    </DataTableCard>
  );
}
