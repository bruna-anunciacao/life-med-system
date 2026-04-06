"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { usersService } from "../../../../services/users-service";
import { toast } from "sonner";
import { SearchBar } from "./components/SearchBar";
import { DoctorCard } from "./components/DoctorCard";
import { EmptySearch } from "./components/EmptySearch";

type Professional = {
  id: string;
  name: string;
  email: string;
  status: string;
  professionalProfile?: {
    id: string;
    specialty: string;
    professionalLicense: string;
    modality?: string;
    bio?: string;
  };
};

const SearchDoctorsPage = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Todas");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await usersService.getAllProfessionals();
        setProfessionals(data);
      } catch {
        toast.error("Erro ao carregar profissionais.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = professionals
    .filter((p) => p.status !== "PENDING" && p.status !== "BLOCKED")
    .filter((p) => {
      const term = search.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(term) ||
        (p.professionalProfile?.specialty || "").toLowerCase().includes(term);
      const matchesSpecialty =
        selectedSpecialty === "Todas" ||
        (p.professionalProfile?.specialty || "")
          .toLowerCase()
          .includes(selectedSpecialty.toLowerCase());
      return matchesSearch && matchesSpecialty;
    });

  return (
    <section className="w-full min-h-screen mx-auto px-4 sm:px-8 lg:px-16 py-6 sm:py-8 bg-[#f8fafc]">
      <div className="mb-6 sm:mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">Buscar Médicos</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500">
            Encontre profissionais de saúde voluntários e agende sua consulta gratuitamente.
          </p>
        </div>
      </div>

      <SearchBar
        search={search}
        selectedSpecialty={selectedSpecialty}
        resultsCount={filtered.length}
        isLoading={isLoading}
        onSearchChange={setSearch}
        onSpecialtyChange={setSelectedSpecialty}
      />

      {isLoading ? (
        <div className="py-16 px-8 flex justify-center items-center"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptySearch />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((prof) => (
            <DoctorCard key={prof.id} professional={prof} />
          ))}
        </div>
      )}
    </section>
  );
};

export default SearchDoctorsPage;
