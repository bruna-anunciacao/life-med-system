"use client";

import { useMemo, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  DataTablePageSizeSelector,
  DataTablePagination,
} from "@/components/ui/data-table";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePagination } from "@/hooks/usePagination";
import { PageShell, PageHeader } from "../../../../ui/dashboard/page-shell";
import { TourButton } from "@/components/tour/TourButton";
import { SearchBar } from "../../../patient/search/components/SearchBar";
import { DoctorCard } from "../../../patient/search/components/DoctorCard";
import { EmptySearch } from "../../../patient/search/components/EmptySearch";
import { ProfessionalData, SeeProfileModal } from "../../../patient/search/components/SeeProfileModal";
import { ManagerBookingModal } from "./components/ManagerBookingModal";
import { useListPatientsQuery } from "@/queries/useListPatientsQuery";
import { useProfessionalsQuery } from "@/queries/useProfessionalsQuery";
import { AddressData } from "../../../patient/search/components/addressMaps";
import {
  getAvailableLocations,
  getLocationValue,
} from "../../../patient/search/components/locationFilters";

type Professional = {
  id: string;
  name: string;
  email: string;
  status: string;
  professionalProfile?: {
    id?: string;
    specialty?: string;
    professionalLicense?: string;
    modality?: string;
    bio?: string;
    photoUrl?: string;
    specialities?: { id: string; name: string }[];
  } | null;
  address?: AddressData | null;
};

const NewApointmentPage = () => {
  const isMobile = useIsMobile();
  const { data: patients = [] } = useListPatientsQuery();
  const { data: professionals = [], isLoading } = useProfessionalsQuery();
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Todas");
  const [selectedLocation, setSelectedLocation] = useState("Todas");
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);
  const [bookingProfessional, setBookingProfessional] =
    useState<Professional | null>(null);

  const visibleProfessionals = professionals.filter(
    (p) => p.status !== "PENDING" && p.status !== "BLOCKED",
  );
  const locations = useMemo(
    () => getAvailableLocations(professionals),
    [professionals],
  );

  const filtered = visibleProfessionals.filter((p) => {
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

  const pagination = usePagination(filtered, {
    initialPageSize: 10,
    resetKeys: [search, selectedSpecialty, selectedLocation],
  });

  return (
    <PageShell>
      <PageHeader
        title="Agendamento de consulta"
        help={<TourButton tour="manager-new-appointment" />}
      />

      <div id="tour-mgr-new-search">
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

      <div id="tour-mgr-new-results">
      {isLoading ? (
        <div className="py-16 px-8 flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptySearch />
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <DataTablePageSizeSelector
              pageSize={pagination.pageSize}
              onPageSizeChange={pagination.setPageSize}
            />
          </div>
          <div
            className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}
          >
            {pagination.pageItems.map((prof) => (
              <DoctorCard
                key={prof.id}
                professional={prof}
                onViewProfile={() => setSelectedProfessional(prof)}
                onBook={() => setBookingProfessional(prof)}
              />
            ))}
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
            <DataTablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              from={pagination.from}
              to={pagination.to}
              totalItems={pagination.totalItems}
              hasPrev={pagination.hasPrev}
              hasNext={pagination.hasNext}
              onPageChange={pagination.setPage}
              itemLabel="profissionais"
            />
          </div>
        </>
      )}
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

      <ManagerBookingModal
        isOpen={!!bookingProfessional}
        onOpenChange={(open) => {
          if (!open) setBookingProfessional(null);
        }}
        patients={patients}
        professional={bookingProfessional as unknown as Professional}
      />
    </PageShell>
  );
};

export default NewApointmentPage;
