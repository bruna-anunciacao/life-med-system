"use client";

import { useState } from "react";
import { CardGridSkeleton } from "@/components/ui/skeletons";
import { DataTablePageSizeSelector, DataTablePagination } from "@/components/ui/data-table";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useServerPagination } from "@/hooks/useServerPagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  usePatientSearchProfessionalsQuery,
  useProfessionalLocationsQuery,
} from "@/queries/usePatientSearchProfessionalsQuery";
import { SearchBar } from "./components/SearchBar";
import { DoctorCard } from "./components/DoctorCard";
import { EmptySearch } from "./components/EmptySearch";
import {
  ProfessionalData,
  SeeProfileModal,
} from "./components/SeeProfileModal";
import { BookingModal } from "./components/BookingModal";
import { AddressData } from "./components/addressMaps";
import { parseLocationValue } from "./components/locationFilters";
import { PageShell, PageHeader } from "../../../ui/dashboard/page-shell";
import { TourButton } from "@/components/tour/TourButton";

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
  const [searchInput, setSearchInput] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Todas");
  const [selectedLocation, setSelectedLocation] = useState("Todas");

  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);
  const [bookingProfessional, setBookingProfessional] =
    useState<Professional | null>(null);

  const search = useDebouncedValue(searchInput, 400);
  const { page, pageSize, setPage, setPageSize, getPaginationProps } =
    useServerPagination({ initialPageSize: 10 });

  const selectedLocationOption =
    selectedLocation === "Todas" ? null : parseLocationValue(selectedLocation);

  const { data, isLoading, isFetching } = usePatientSearchProfessionalsQuery({
    page,
    limit: pageSize,
    ...(search && { search }),
    ...(selectedSpecialty !== "Todas" && { speciality: selectedSpecialty }),
    ...(selectedLocationOption && {
      city: selectedLocationOption.city,
      state: selectedLocationOption.state,
    }),
  });

  const { data: locations = [] } = useProfessionalLocationsQuery();

  const professionals = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPage(1);
  }

  function handleSpecialtyChange(value: string) {
    setSelectedSpecialty(value);
    setPage(1);
  }

  function handleLocationChange(value: string) {
    setSelectedLocation(value);
    setPage(1);
  }

  return (
    <PageShell>
      <PageHeader
        title="Buscar Médicos"
        description="Encontre profissionais de saúde voluntários e agende sua consulta gratuitamente."
        help={<TourButton tour="patient-search" iconOnly={isMobile} />}
      />

      <div
        id="tour-search-bar"
        title="Pesquisar e filtrar médicos por nome, especialidade ou localização"
      >
        <SearchBar
          search={searchInput}
          selectedSpecialty={selectedSpecialty}
          selectedLocation={selectedLocation}
          locations={locations}
          resultsCount={total}
          isLoading={isLoading}
          onSearchChange={handleSearchChange}
          onSpecialtyChange={handleSpecialtyChange}
          onLocationChange={handleLocationChange}
        />
        <div className="mb-4 flex justify-end">
          <DataTablePageSizeSelector
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      <div id="tour-search-results">
        {isLoading ? (
          <CardGridSkeleton count={6} minWidth={360} />
        ) : professionals.length === 0 ? (
          <EmptySearch />
        ) : (
          <div
            className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}
          >
            {professionals.map((prof) => (
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

        <DataTablePagination
          {...getPaginationProps(data?.meta)}
          busy={isFetching}
          itemLabel="profissionais"
        />
      </div>

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
