"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, PlusIcon } from "../../../utils/icons";
import Image from "next/image";

type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit?: string;
  photoUrl?: string;
};

const mockPatients: Patient[] = [
  { id: "1", name: "Maria Clara", email: "maria@email.com", phone: "(11) 99999-1111", lastVisit: "10/02/2026", photoUrl: "" },
  { id: "2", name: "Lucas Mendes", email: "lucas@email.com", phone: "(11) 98888-2222", lastVisit: "05/02/2026" },
  { id: "3", name: "Ana Souza", email: "ana@email.com", phone: "(11) 97777-3333" },
];

export default function PatientsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockPatients.filter((p) => {
    const term = search.toLowerCase();
    return Object.values(p)
      .filter((value) => typeof value === "string")
      .some((value) => value.toLowerCase().includes(term));
  });

  const renderAvatar = (name: string, photoUrl?: string) => {
    if (photoUrl) {
      return (
        <Image
          src={photoUrl}
          alt={name}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover object-center border border-gray-200 p-1 bg-[#fafafa] shadow-sm"
        />
      );
    }
    return (
      <div className="w-12 h-12 rounded-full font-semibold flex items-center justify-center text-[#006fee] bg-[#e6f1ff] border border-gray-200 p-1 shadow-sm">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <section className="w-full min-h-screen mx-auto px-16 py-8 bg-[#f8fafc]">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Pacientes</h1>
          <p className="mt-1 text-gray-500">Gerencie e visualize seus pacientes cadastrados.</p>
        </div>
        <Button size="lg">
          <PlusIcon />
          Novo Paciente
        </Button>
      </div>

      <div className="mb-8 max-w-[400px] relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon />
        </span>
        <Input
          placeholder="Buscar paciente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 px-4 rounded-lg border border-slate-300 text-sm text-slate-700 bg-white outline-none transition-all duration-200 pl-10"
        />
      </div>

      <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {filtered.map((patient) => (
          <div
            key={patient.id}
            className="bg-white rounded-2xl border border-gray-200 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)]"
          >
            <div className="flex gap-4 items-center mb-4">
              {renderAvatar(patient.name, patient.photoUrl)}
              <div>
                <h3 className="font-semibold text-base text-gray-900">{patient.name}</h3>
                <p className="text-[0.85rem] text-gray-500">{patient.email}</p>
              </div>
            </div>
            <div className="text-[0.9rem] text-gray-700 mb-4">
              <p><strong>Telefone:</strong> {patient.phone}</p>
              <p><strong>Última Consulta:</strong> {patient.lastVisit ?? "—"}</p>
            </div>
            <div className="flex justify-end">
              <Button size="sm">Ver Perfil</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
