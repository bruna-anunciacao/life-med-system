"use client";

import { useForm, Controller} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { managerService } from "../../../../../services/manager-service";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/useIsMobile";
import { SearchBar } from "../../../patient/search/components/SearchBar";
import { DoctorCard } from "../../../patient/search/components/DoctorCard";
import { EmptySearch } from "../../../patient/search/components/EmptySearch";
import { ProfessionalData, SeeProfileModal } from "../../../patient/search/components/SeeProfileModal";
import { BookingModal } from "../../../patient/search/components/BookingModal";
import { useListPatientsQuery } from "@/queries/useListPatientsQuery";
import { Autocomplete } from "@/components/ui/autocomplete";
import { Label } from "@/components/ui/label";
import { newAppointmentSchema, type NewAppointmentSchema } from './new-appointment.validation';

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
    address?: string;
    specialities?: { id: string; name: string }[];
  } | null;
};

const NewApointmentPage = () => {
  const isMobile = useIsMobile();
  const { data: patients = [] } = useListPatientsQuery();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Todas");
  const [selectedLocation, setSelectedLocation] = useState("Todas");
  
  
    const {
    control,
    watch,
    formState: { errors },
  } = useForm<NewAppointmentSchema>({
    resolver: zodResolver(newAppointmentSchema),
    defaultValues: { patientId: '', professionalId: '', dateTime: '', notes: '' },
  });

  const selectedPatientId = watch('patientId');
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);
  const [bookingProfessional, setBookingProfessional] =
    useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await managerService.listProfessionals();
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
            className={`my-10 font-bold text-gray-900 tracking-tight ${isMobile ? "text-2xl" : "text-4xl"}`}
          >
            Agendamento de consulta
          </h1>
        <div className="space-y-2">
              <Label htmlFor="patientId">Paciente</Label>
              <Controller
                name="patientId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    items={patients.map((p: { id: string; email: string; name?: string }) => ({
                      id: p.id,
                      email: p.email,
                      label: p.name || p.email,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Buscar paciente..."
                    displayKey="email"
                  />
                )}
              />
              {errors.patientId && (
                <p className="text-xs text-red-500">{errors.patientId.message}</p>
              )}
            </div>
        </div>
      </div>

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
            <DoctorCard
              key={prof.id}
              professional={prof}
              onViewProfile={() => setSelectedProfessional(prof)}
              onBook={() => setBookingProfessional(prof)}
            />
          ))}
        </div>
      )}

      <SeeProfileModal
        isOpen={!!selectedProfessional}
        onOpenChange={(open) => {
          if (!open) setSelectedProfessional(null);
        }}
        professional={selectedProfessional as unknown as ProfessionalData}
      />

      <BookingModal
        isOpen={!!bookingProfessional}
        onOpenChange={(open) => {
          if (!open) setBookingProfessional(null);
        }}
        pacienteId={selectedPatientId}
        professional={bookingProfessional as unknown as Professional}/>
    </section>
  );
};

export default NewApointmentPage;
