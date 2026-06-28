"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CardGridSkeleton } from "@/components/ui/skeletons";
import { Badge } from "@/components/ui/badge";
import { useMedicalRecordsListQuery } from "@/queries/useMedicalRecords";
import { SearchInput } from "@/components/ui/search-input";
import { CalendarIcon, EyeIcon } from "../../../utils/icons";
import { PageShell, PageHeader } from "../../../ui/dashboard/page-shell";
import { TourButton } from "@/components/tour/TourButton";

const PAGE_SIZE = 10;

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

const MedicalRecordsListPage = () => {
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
    <PageShell>
      <PageHeader
        title="Prontuários"
        description={`Prontuários médicos criados por você.{" "}
         ${total > 0 ? ` ${total} no total.` : ""}`}
        help={<TourButton tour="professional-records" />}
      />

      <Card id="tour-prof-records-search" className="mb-6 border border-gray-200 rounded-xl bg-white">
        <CardContent className="p-4 sm:p-5">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
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
              <label className="text-xs font-medium text-slate-600">
                Data inicial
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-44"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">
                Data final
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-44"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" title="Aplicar busca">
                Buscar
              </Button>
              {hasFilters && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearFilters}
                  title="Remover filtros"
                >
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
        <Card className="border border-dashed border-gray-300 rounded-xl bg-white">
          <CardContent className="py-16 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarIcon size={28} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">
                Nenhum prontuário encontrado
              </p>
              <p className="text-sm text-slate-500 mt-1 max-w-md">
                {hasFilters
                  ? "Tente ajustar os filtros acima."
                  : "Os prontuários que você criar a partir das consultas aparecerão aqui."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div id="tour-prof-records-list" className="flex flex-col gap-3">
          {records.map((record) => (
            <Card
              key={record.id}
              className="border border-gray-200 rounded-xl bg-white"
            >
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
                        {record.appointment.modality === "VIRTUAL"
                          ? "Virtual"
                          : "Presencial"}
                      </Badge>
                    )}
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarIcon size={14} />
                    {record.appointment
                      ? formatDateTime(record.appointment.dateTime)
                      : `Criado em ${formatDateTime(record.createdAt)}`}
                  </p>
                  {(record.diagnosis || record.chiefComplaint) && (
                    <p className="text-sm text-slate-700 line-clamp-1 mt-0.5">
                      <span className="text-slate-500">
                        {record.diagnosis ? "Diagnóstico: " : "Queixa: "}
                      </span>
                      {truncate(record.diagnosis ?? record.chiefComplaint)}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(
                      `/dashboard/professional/medical-records/${record.id}`,
                    )
                  }
                  title="Abrir prontuário"
                  className="shrink-0"
                >
                  <EyeIcon size={16} /> Abrir
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              title="Página anterior"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              title="Próxima página"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default MedicalRecordsListPage;
