"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { SearchIcon } from "../../../utils/icons";
import { useProfessionalPatients } from "@/queries/useProfessionalPatients";
import { PatientCard, PatientCardData } from "./components/PatientCard";

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const { data: patients = [], isLoading, isError } = useProfessionalPatients();

  const filtered = patients.filter((p) => {
    const term = search.toLowerCase();
    return Object.values(p)
      .filter((value) => typeof value === "string")
      .some((value) => (value as string).toLowerCase().includes(term));
  });

  return (
    <section className="w-full min-h-screen mx-auto px-4 py-6 sm:px-16 sm:py-8 bg-[#f8fafc]">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
          Pacientes
        </h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500">
          Acompanhe o perfil e o histórico dos pacientes que você atende.
        </p>
      </div>

      <div className="mb-6 sm:mb-8 w-full sm:max-w-100 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon />
        </span>
        <Input
          placeholder="Buscar paciente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          title="Digite o nome ou informação para filtrar os pacientes"
          className="h-12 w-full px-4 rounded-lg border border-slate-300 text-sm text-slate-700 bg-white outline-none transition-all duration-200 pl-10"
        />
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="py-20 text-center text-red-500 font-medium">
          Não foi possível carregar a lista de pacientes.
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          Nenhum paciente encontrado.
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
          {filtered.map((patient) => (
            <div key={patient.id} title="Visualizar detalhes do paciente">
              <PatientCard patient={patient as PatientCardData} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
