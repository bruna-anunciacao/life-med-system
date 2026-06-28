"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CardGridSkeleton } from "@/components/ui/skeletons";
import { Badge } from "@/components/ui/badge";
import {
  useMedicalRecordsListQuery,
  useSharedMedicalRecordsQuery,
} from "@/queries/useMedicalRecords";
import { SearchInput } from "@/components/ui/search-input";
import { CalendarIcon, EyeIcon, UsersIcon } from "../../../utils/icons";
import { PageShell, PageHeader } from "../../../ui/dashboard/page-shell";
import { TourButton } from "@/components/tour/TourButton";
import type { MedicalRecordResponse } from "@/services/medical-records-service";

const PAGE_SIZE = 10;

type ViewMode = "mine" | "shared";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string | null, max = 120) {
  if (!text) return null;
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

// ——— Vista "Meus prontuários" ———
function MyRecordsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(search && { search }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    }),
    [page, search, startDate, endDate],
  );

  const { data, isLoading, isFetching } = useMedicalRecordsListQuery(params);

  const records = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasFilters = Boolean(search || startDate || endDate);

  return (
    <>
      <Card id="tour-prof-records-search" className="mb-6 border border-gray-200 rounded-xl bg-white">
        <CardContent className="p-4 sm:p-5">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">
                Buscar (paciente, queixa ou diagnóstico)
              </label>
              <SearchInput
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ex.: João Silva, enxaqueca…"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Data inicial</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="w-full sm:w-44"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Data final</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="w-full sm:w-44"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" title="Aplicar busca">Buscar</Button>
              {hasFilters && (
                <Button type="button" variant="outline" onClick={handleClearFilters} title="Remover filtros">
                  Limpar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <CardGridSkeleton count={4} minWidth={400} />
      ) : records.length === 0 ? (
        <EmptyState hasFilters={hasFilters} mode="mine" />
      ) : (
        <div id="tour-prof-records-list" className="flex flex-col gap-3">
          {records.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onClick={() => router.push(`/dashboard/professional/medical-records/${record.id}`)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Página {page} de {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Próxima</Button>
          </div>
        </div>
      )}
    </>
  );
}

// ——— Vista "Todos do paciente" (prontuários de pacientes já atendidos) ———
function SharedRecordsView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({ page, limit: PAGE_SIZE, ...(search && { search }) }),
    [page, search],
  );

  const { data, isLoading, isFetching } = useSharedMedicalRecordsQuery(params);

  const records = (data?.data ?? []) as MedicalRecordResponse[];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <>
      <Card className="mb-6 border border-gray-200 rounded-xl bg-white">
        <CardContent className="p-4 sm:p-5">
          <form onSubmit={handleSearch} className="flex gap-3">
            <SearchInput
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por paciente, profissional, queixa ou diagnóstico…"
              className="flex-1"
            />
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <CardGridSkeleton count={4} minWidth={400} />
      ) : records.length === 0 ? (
        <EmptyState hasFilters={Boolean(search)} mode="shared" />
      ) : (
        <div className="flex flex-col gap-3">
          {records.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              shared
              onClick={() =>
                router.push(`/dashboard/professional/medical-records/shared/${record.id}`)
              }
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Página {page} de {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Próxima</Button>
          </div>
        </div>
      )}
    </>
  );
}

// ——— Card reutilizável ———
function RecordCard({
  record,
  shared = false,
  onClick,
}: {
  record: MedicalRecordResponse;
  shared?: boolean;
  onClick: () => void;
}) {
  return (
    <Card className="border border-gray-200 rounded-xl bg-white">
      <CardContent className="p-4 sm:p-5 flex gap-4 items-center">
        <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-semibold shrink-0">
          {(record.patient?.name ?? "P").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold text-slate-900 truncate">
              {record.patient?.name ?? "Paciente"}
            </h3>
            {record.appointment && (
              <Badge className="bg-slate-100 text-slate-600 px-2 py-0.5 text-[11px] rounded font-medium">
                {record.appointment.modality === "VIRTUAL" ? "Virtual" : "Presencial"}
              </Badge>
            )}
            {shared && (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[11px] rounded font-medium">
                Somente leitura
              </Badge>
            )}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarIcon size={14} />
            {record.appointment
              ? formatDateTime(record.appointment.dateTime)
              : `Criado em ${formatDateTime(record.createdAt)}`}
          </p>
          {shared && (
            <p className="text-xs text-slate-400">
              Registrado por <span className="font-medium text-slate-600">{record.author.name}</span>
            </p>
          )}
          {(record.diagnosis || record.chiefComplaint) && (
            <p className="text-sm text-slate-700 line-clamp-1 mt-0.5">
              <span className="text-slate-500">
                {record.diagnosis ? "Diagnóstico: " : "Queixa: "}
              </span>
              {truncate(record.diagnosis ?? record.chiefComplaint)}
            </p>
          )}
        </div>
        <Button size="sm" onClick={onClick} title="Abrir prontuário" className="shrink-0">
          <EyeIcon size={16} /> Abrir
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyState({ hasFilters, mode }: { hasFilters: boolean; mode: ViewMode }) {
  return (
    <Card className="border border-dashed border-gray-300 rounded-xl bg-white">
      <CardContent className="py-16 text-center flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
          {mode === "shared" ? <UsersIcon size={28} /> : <CalendarIcon size={28} />}
        </div>
        <div>
          <p className="text-base font-semibold text-slate-800">
            {mode === "shared" ? "Nenhum prontuário compartilhado" : "Nenhum prontuário encontrado"}
          </p>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            {hasFilters
              ? "Tente ajustar os filtros acima."
              : mode === "shared"
                ? "Os prontuários de pacientes que você já atendeu, criados por outros profissionais, aparecerão aqui."
                : "Os prontuários que você criar a partir das consultas aparecerão aqui."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ——— Página principal com toggle ———
const MedicalRecordsListPage = () => {
  const searchParams = useSearchParams();
  const initialView = (searchParams.get("view") as ViewMode) ?? "mine";
  const [view, setView] = useState<ViewMode>(initialView);

  const TABS: { label: string; value: ViewMode }[] = [
    { label: "Meus prontuários", value: "mine" },
    { label: "Todos do paciente", value: "shared" },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Prontuários"
        description="Prontuários médicos criados por você e de pacientes que você já atendeu."
        help={<TourButton tour="professional-records" />}
      />

      {/* Toggle */}
      <div className="mb-6 flex rounded-lg border border-border bg-background text-sm overflow-hidden w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setView(tab.value)}
            className={`px-4 py-2 font-medium transition-colors ${
              view === tab.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === "mine" ? <MyRecordsView /> : <SharedRecordsView />}
    </PageShell>
  );
};

export default MedicalRecordsListPage;
