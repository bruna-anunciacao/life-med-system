"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { professionalsService } from "../../../../services/professionals-service";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/useIsMobile";
import { SearchBar } from "./components/SearchBar";
import { DoctorCard } from "./components/DoctorCard";
import { EmptySearch } from "./components/EmptySearch";
import {
  ProfessionalData,
  SeeProfileModal,
} from "./components/SeeProfileModal";
import { BookingModal } from "./components/BookingModal";

type Professional = {
  id: string;
  name: string;
  email: string;
  status: string;
  professionalProfile?: {
    id?: string;
    specialities?: { id: string; name: string }[];
    professionalLicense?: string;
    modality?: string;
    bio?: string;
    photoUrl?: string;
    address?: string;
  } | null;
};

const SearchDoctorsPage = () => {
  const isMobile = useIsMobile();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Todas");
  const [selectedLocation, setSelectedLocation] = useState("Todas");

  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);
  const [bookingProfessional, setBookingProfessional] =
    useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await professionalsService.listAll();
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
        (p.professionalProfile?.specialities?.[0]?.name || "")
          .toLowerCase()
          .includes(term);

      const matchesSpecialty =
        selectedSpecialty === "Todas" ||
        (p.professionalProfile?.specialities?.[0]?.name || "")
          .toLowerCase()
          .includes(selectedSpecialty.toLowerCase());

      const matchesLocation =
        selectedLocation === "Todas" ||
        (p.professionalProfile?.address || "")
          .toLowerCase()
          .includes(selectedLocation.toLowerCase());

      return matchesSearch && matchesSpecialty && matchesLocation;
    });

  return (
    <section
      className={`w-full min-h-screen mx-auto bg-[#f8fafc] ${isMobile ? "px-4 py-5" : "px-16 py-8"}`}
    >
      <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1
            className={`font-bold text-gray-900 tracking-tight ${isMobile ? "text-2xl" : "text-4xl"}`}
          >
            Buscar Médicos
          </h1>
          <p
            className={`mt-1 text-gray-500 ${isMobile ? "text-sm" : "text-base"}`}
          >
            Encontre profissionais de saúde voluntários e agende sua consulta
            gratuitamente.
          </p>
        </div>
      </div>

      <div title="Pesquisar e filtrar médicos por nome, especialidade ou localização">
        <SearchBar
          search={search}
          selectedSpecialty={selectedSpecialty}
          selectedLocation={selectedLocation}
          resultsCount={filtered.length}
          isLoading={isLoading}
          onSearchChange={setSearch}
          onSpecialtyChange={setSelectedSpecialty}
          onLocationChange={setSelectedLocation}
        />
      </div>

      {isLoading ? (
        <div className="py-16 px-8 flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptySearch />
      ) : (
        <div
          className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}
        >
          {filtered.map((prof) => (
            <div
              key={prof.id}
              title={`Visualizar perfil ou agendar com ${prof.name}`}
            >
              <DoctorCard
                professional={prof}
                onViewProfile={() => setSelectedProfessional(prof)}
                onBook={() => setBookingProfessional(prof)}
              />
            </div>
          ))}
        </div>
      )}

      <SeeProfileModal
        isOpen={!!selectedProfessional}
        onOpenChange={(open) => {
          if (!open) setSelectedProfessional(null);
        }}
        professional={selectedProfessional as unknown as ProfessionalData}
        onBook={() => {
          setBookingProfessional(selectedProfessional);
          setSelectedProfessional(null);
        }}
      />

      <BookingModal
        isOpen={!!bookingProfessional}
        onOpenChange={(open) => {
          if (!open) setBookingProfessional(null);
        }}
        professional={bookingProfessional as unknown as Professional}
      />
    </section>
  );
};

export default SearchDoctorsPage;
