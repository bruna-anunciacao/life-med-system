import { SearchIcon } from "../../../../utils/icons";

const SPECIALTIES = [
  "Todas", "Cardiologia", "Dermatologia", "Clínico Geral",
  "Nutrição", "Ortopedia", "Pediatria", "Psicologia", "Psiquiatria",
];

type SearchBarProps = {
  search: string;
  selectedSpecialty: string;
  resultsCount: number;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
};

export function SearchBar({
  search,
  selectedSpecialty,
  resultsCount,
  isLoading,
  onSearchChange,
  onSpecialtyChange,
}: SearchBarProps) {
  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="w-full px-4 py-3 flex items-center gap-3 border border-gray-200 rounded-xl bg-white text-base transition-colors duration-200 focus-within:border-[#006fee] focus-within:shadow-[0_0_0_3px_rgba(0,111,238,0.1)]">
        <span className="text-gray-400 flex-shrink-0"><SearchIcon /></span>
        <input
          type="text"
          className="flex-1 border-none outline-none bg-transparent text-base text-gray-900 placeholder:text-gray-400"
          placeholder="Buscar por nome ou especialidade..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {SPECIALTIES.map((spec) => (
          <button
            key={spec}
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
          {resultsCount} {resultsCount === 1 ? "profissional encontrado" : "profissionais encontrados"}
        </p>
      )}
    </div>
  );
}
