"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminUser } from "../../../../services/admin-service";
import { useAdminUsersTable, TypeFilter } from "@/queries/useAdminUsersTable";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Check, Ban, Pencil } from "lucide-react";

type SortField = "name" | "status";
type SortDir = "asc" | "desc";

const TYPE_TABS: { label: string; value: TypeFilter }[] = [
  { label: "Todos", value: "all" },
  { label: "Pacientes", value: "PATIENT" },
  { label: "Profissionais", value: "PROFESSIONAL" },
];

const TYPE_BADGE: Record<"PATIENT" | "PROFESSIONAL", { label: string; className: string }> = {
  PATIENT: { label: "Paciente", className: "bg-blue-50 text-blue-600 border border-blue-200" },
  PROFESSIONAL: { label: "Profissional", className: "bg-violet-50 text-violet-600 border border-violet-200" },
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

  const sortedUsers = useMemo(() => {
    if (!sortField) return users;
    return [...users].sort((a, b) => {
      const cmp = a[sortField].localeCompare(b[sortField]);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [users, sortField, sortDir]);

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <ArrowUpDown className="ml-1.5 inline h-3.5 w-3.5 text-muted-foreground/50" />;
    return sortDir === "asc"
      ? <ArrowUp className="ml-1.5 inline h-3.5 w-3.5 text-foreground" />
      : <ArrowDown className="ml-1.5 inline h-3.5 w-3.5 text-foreground" />;
  }

  const filterBar = (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 sm:px-6 sm:gap-3">
      <div className="flex rounded-lg border border-border bg-background text-sm overflow-hidden">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setTypeFilter(tab.value)}
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
        className="h-8 flex-1 min-w-[160px] max-w-xs text-sm bg-background"
      />
    </div>
  );

  return (
    <div className="w-full rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border sm:px-6">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">Usuários</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {sortedUsers.length}
          </span>
        </div>
        {actions && <div>{actions}</div>}
      </div>

      {filterBar}

      {/* Loading / empty */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Carregando...</div>
      ) : sortedUsers.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Nenhum usuário encontrado.
        </div>
      ) : isMobile ? (
        /* ── Mobile: cards ── */
        <div className="divide-y divide-border">
          {sortedUsers.map((user) => {
            const badge = TYPE_BADGE[user.role];
            const speciality = getSpeciality(user);
            return (
              <div key={user.id} className="flex items-start gap-3 px-4 py-4">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold">
                  {getInitials(user.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
                  {speciality && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{speciality}</p>
                  )}
                  <div className="mt-2">
                    <StatusBadge status={user.status} type="user" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => router.push(`/dashboard/admin/users/${user.id}`)}
                  >
                    <Eye />
                  </Button>
                  {(user.status === "COMPLETED" || user.status === "BLOCKED") && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
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
                      onClick={() => onStatusChange(user.id, "BLOCKED")}
                    >
                      <Ban />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => router.push(`/dashboard/admin/users/${user.id}?edit=1`)}
                  >
                    <Pencil />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Desktop: table ── */
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className="pl-6 cursor-pointer select-none"
                onClick={() => toggleSort("name")}
              >
                Usuário <SortIcon field="name" />
              </TableHead>
              <TableHead className="text-center">Tipo</TableHead>
              <TableHead className="text-center">Especialidade</TableHead>
              <TableHead
                className="text-center cursor-pointer select-none"
                onClick={() => toggleSort("status")}
              >
                Status <SortIcon field="status" />
              </TableHead>
              <TableHead className="pr-6 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user) => {
              const badge = TYPE_BADGE[user.role];
              const speciality = getSpeciality(user);
              return (
                <TableRow key={user.id}>
                  <TableCell className="pl-6">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </TableCell>

                  <TableCell className="text-center text-sm text-muted-foreground">
                    {speciality ?? <span className="text-muted-foreground/40">—</span>}
                  </TableCell>

                  <TableCell className="text-center">
                    <StatusBadge status={user.status} type="user" />
                  </TableCell>

                  <TableCell className="pr-6">
                    <div className="flex items-center justify-center gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => router.push(`/dashboard/admin/users/${user.id}`)}
                      >
                        <Eye />
                      </Button>

                      {(user.status === "COMPLETED" || user.status === "BLOCKED") && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
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
                          onClick={() => onStatusChange(user.id, "BLOCKED")}
                        >
                          <Ban />
                        </Button>
                      )}

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => router.push(`/dashboard/admin/users/${user.id}?edit=1`)}
                      >
                        <Pencil />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
