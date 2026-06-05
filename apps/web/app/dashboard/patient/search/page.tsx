"use client";

import { useEffect, useMemo, useState } from "react";
import { CardGridSkeleton } from "@/components/ui/skeletons";
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
import { AddressData } from "./components/addressMaps";
import { getAvailableLocations, getLocationValue } from "./components/locationFilters";
import { PageShell, PageHeader } from "../../../ui/dashboard/page-shell";

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
  } | null;
  address?: AddressData | null;
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

  const visibleProfessionals = professionals.filter(
    (p) => p.status !== "PENDING" && p.status !== "BLOCKED",
  );
  const locations = useMemo(
    () => getAvailableLocations(professionals),
    [professionals],
  );

  const filtered = visibleProfessionals
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
        (p.address?.city && p.address?.state
          ? getLocationValue({
              city: p.address.city.trim(),
              state: p.address.state.trim(),
            }) === selectedLocation
          : false);

      return matchesSearch && matchesSpecialty && matchesLocation;
    });

  return (
    <PageShell>
      <PageHeader
        title="Buscar Médicos"
        description="Encontre profissionais de saúde voluntários e agende sua consulta gratuitamente."
      />

      <div title="Pesquisar e filtrar médicos por nome, especialidade ou localização">
        <SearchBar
          search={search}
          selectedSpecialty={selectedSpecialty}
          selectedLocation={selectedLocation}
          locations={locations}
          resultsCount={filtered.length}
          isLoading={isLoading}
          onSearchChange={setSearch}
          onSpecialtyChange={setSelectedSpecialty}
          onLocationChange={setSelectedLocation}
        />
      </div>

      {isLoading ? (
        <CardGridSkeleton count={6} minWidth={360} />
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
    </PageShell>
  );
};

export default SearchDoctorsPage;
