import { SearchIcon } from "../../../../utils/icons";

export function EmptySearch() {
  return (
    <div className="py-16 px-8 flex flex-col items-center gap-3 text-center">
      <SearchIcon />
      <h3 className="text-lg font-semibold text-gray-700">Nenhum profissional encontrado</h3>
      <p className="text-sm text-gray-500">Tente alterar os filtros ou buscar por outro termo.</p>
    </div>
  );
}
