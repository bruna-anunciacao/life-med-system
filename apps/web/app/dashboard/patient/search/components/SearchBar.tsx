import { SearchInput } from "@/components/ui/search-input";
import { getLocationValue, LocationOption } from "./locationFilters";

const SPECIALTIES = [
  "Todas",
  "Cardiologia",
  "Clínico Geral",
  "Dermatologia",
  "Nutrição",
  "Ortopedia",
  "Pediatria",
  "Psicologia",
  "Psiquiatria",
];

type SearchBarProps = {
  search: string;
  selectedSpecialty: string;
  selectedLocation: string;
  locations: LocationOption[];
  resultsCount: number;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
  onLocationChange: (value: string) => void;
};

export function SearchBar({
  search,
  selectedSpecialty,
  selectedLocation,
  locations,
  resultsCount,
  isLoading,
  onSearchChange,
  onSpecialtyChange,
  onLocationChange,
}: SearchBarProps) {
  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-3 w-full">
        <SearchInput
          className="flex-1 h-12.5 rounded-xl text-base"
          placeholder="Buscar por nome ou especialidade..."
          title="Buscar por nome ou especialidade"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <select
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          title="Selecione a localidade desejada"
          className="w-full md:w-64 px-4 py-3 border border-gray-200 rounded-xl bg-white text-base text-gray-700 outline-none transition-colors duration-200 focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] cursor-pointer"
        >
          <option value="Todas">Todas as localidades</option>
          {locations.map((loc) => (
            <option key={getLocationValue(loc)} value={getLocationValue(loc)}>
              {getLocationValue(loc)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {SPECIALTIES.map((spec) => (
          <button
            key={spec}
            title={
              spec === "Todas"
                ? "Mostrar todas as especialidades"
                : `Filtrar resultados por ${spec}`
            }
            className={
              selectedSpecialty === spec
                ? "px-4 py-1.5 border border-[#006fee] rounded-full bg-[rgba(0,111,238,0.08)] text-sm font-semibold text-[#006fee] cursor-pointer transition-all duration-200"
                : "px-4 py-1.5 border border-gray-200 rounded-full bg-white text-sm font-medium text-gray-700 cursor-pointer transition-all duration-200 hover:border-[#006fee] hover:text-[#006fee]"
            }
            onClick={() => onSpecialtyChange(spec)}
          >
            {spec}
          </button>
        ))}
      </div>

      {!isLoading && (
        <p className="text-sm text-gray-500">
          {resultsCount}{" "}
          {resultsCount === 1
            ? "profissional encontrado"
            : "profissionais encontrados"}
        </p>
      )}
    </div>
  );
}
