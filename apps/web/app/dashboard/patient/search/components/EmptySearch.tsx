import { SearchIcon } from "../../../../utils/icons";
import styles from "../search.module.css";

export function EmptySearch() {
  return (
    <div className={styles.emptyState}>
      <SearchIcon />
      <h3 className={styles.emptyTitle}>Nenhum profissional encontrado</h3>
      <p className={styles.emptyText}>Tente alterar os filtros ou buscar por outro termo.</p>
    </div>
  );
}
