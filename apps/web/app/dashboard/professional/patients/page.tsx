"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CardGridSkeleton } from "@/components/ui/skeletons";
import { UsersIcon } from "../../../utils/icons";
import { useProfessionalPatients } from "@/queries/useProfessionalPatients";
import { PatientCard, PatientCardData } from "./components/PatientCard";
import { PageShell, PageHeader } from "../../../ui/dashboard/page-shell";
import { SearchInput } from "@/components/ui/search-input";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const { data: patients = [], isLoading, isError } = useProfessionalPatients();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;
    const termDigits = onlyDigits(term);
    return patients.filter((p) => {
      const matchesText =
        p.name?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.phone?.toLowerCase().includes(term);
      const matchesCpf =
        termDigits.length > 0 &&
        p.cpf &&
        onlyDigits(p.cpf).includes(termDigits);
      return matchesText || matchesCpf;
    });
  }, [patients, search]);

  const totalLabel =
    patients.length === 1 ? "1 paciente" : `${patients.length} pacientes`;

  const headerDescription = `Acompanhe o perfil e o histórico dos pacientes que você atende.${!isLoading && patients.length > 0 ? ` · ${totalLabel}` : ""}`;

  return (
    <PageShell>
      <PageHeader title="Pacientes" description={headerDescription} />

      <Card className="mb-6 border border-gray-200 rounded-xl bg-white">
        <CardContent className="p-4 sm:p-5">
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">
            Buscar por nome, e-mail, telefone ou CPF
          </label>
          <SearchInput
            placeholder="Ex.: Maria Silva, 123.456.789-00, maria@..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            title="Digite nome, e-mail, telefone ou CPF"
            className="h-11"
          />
          {search && (
            <p className="text-xs text-slate-500 mt-2">
              {filtered.length} resultado{filtered.length === 1 ? "" : "s"} para
              “{search}”
            </p>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : isError ? (
        <Card className="border border-red-200 bg-red-50 rounded-xl">
          <CardContent className="py-10 text-center text-red-600 font-medium">
            Não foi possível carregar a lista de pacientes.
          </CardContent>
        </Card>
      ) : patients.length === 0 ? (
        <Card className="border border-dashed border-gray-300 rounded-xl bg-white">
          <CardContent className="py-16 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <UsersIcon size={28} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">
                Você ainda não tem pacientes
              </p>
              <p className="text-sm text-slate-500 mt-1 max-w-md">
                Assim que uma consulta for agendada com você, o paciente
                aparecerá aqui.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border border-dashed border-gray-300 rounded-xl bg-white">
          <CardContent className="py-12 text-center">
            <p className="text-base font-medium text-slate-700">
              Nenhum paciente encontrado.
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Tente outra busca por nome, e-mail ou CPF.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
          {filtered.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient as PatientCardData}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
