import { SearchIcon } from "../../../../utils/icons";
import styles from "../search.module.css";

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
    <div className={styles.searchArea}>
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}><SearchIcon /></span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por nome ou especialidade..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className={styles.filtersRow}>
        {SPECIALTIES.map((spec) => (
          <button
            key={spec}
            className={selectedSpecialty === spec ? styles.filterChipActive : styles.filterChip}
            onClick={() => onSpecialtyChange(spec)}
          >
            {spec}
          </button>
        ))}
      </div>

      {!isLoading && (
        <p className={styles.resultsInfo}>
          {resultsCount} {resultsCount === 1 ? "profissional encontrado" : "profissionais encontrados"}
        </p>
      )}
    </div>
  );
}
