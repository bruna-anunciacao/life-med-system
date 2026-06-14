import { useEffect, useMemo, useState } from "react";

type UsePaginationOptions = {
  initialPageSize?: number;
  /**
   * Valores que, ao mudarem, devem reiniciar a paginação para a primeira
   * página (ex.: termo de busca, filtro de status, ordenação). Evita ficar
   * preso em uma página vazia depois de filtrar a lista.
   */
  resetKeys?: unknown[];
};

/**
 * Paginação 100% client-side: recebe a lista já filtrada/ordenada e devolve
 * apenas a fatia da página atual, sem sobrecarregar o front renderizando
 * centenas de linhas de uma vez. Não toca na API. O usuário pode trocar a
 * quantidade por página via `setPageSize`.
 */
export function usePagination<T>(
  items: T[],
  { initialPageSize = 10, resetKeys = [] }: UsePaginationOptions = {},
) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reinicia para a primeira página quando os filtros/ordenação mudam.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setPage(1), resetKeys);

  // Trocar a quantidade por página volta para a primeira página.
  useEffect(() => setPage(1), [pageSize]);

  // Garante que a página atual continue válida se a lista encolher.
  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    pageItems,
    from,
    to,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}
