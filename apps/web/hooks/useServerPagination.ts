"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  type PaginationMeta,
} from "@/lib/pagination";

type UseServerPaginationOptions = {
  initialPageSize?: number;
  /**
   * Sincroniza `page`/`limit` na URL (?page=&limit=). Use em telas de listagem
   * cheias, para que a página sobreviva a refresh/voltar. Deixe `false` em
   * abas/toggles internos que já disputam a query string.
   */
  syncUrl?: boolean;
  /** Prefixo dos params na URL, para telas com mais de uma lista paginada. */
  paramPrefix?: string;
};

/**
 * Estado de paginação server-side: controla `page`/`limit` e, junto com o
 * `meta` devolvido pela API, entrega exatamente as props que
 * `DataTablePagination` espera (from/to/hasPrev/hasNext). Não faz fetch — o
 * `page`/`limit` alimentam a query (TanStack) e o `meta` da resposta volta pra
 * `getPaginationProps`.
 */
export function useServerPagination({
  initialPageSize = DEFAULT_PAGE_SIZE,
  syncUrl = false,
  paramPrefix = "",
}: UseServerPaginationOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageKey = `${paramPrefix}page`;
  const limitKey = `${paramPrefix}limit`;

  const urlPage = Number(searchParams.get(pageKey));
  const urlLimit = Number(searchParams.get(limitKey));

  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(initialPageSize);

  const page = syncUrl && urlPage >= 1 ? urlPage : localPage;
  const rawLimit = syncUrl && urlLimit >= 1 ? urlLimit : localPageSize;
  const pageSize = Math.min(rawLimit, MAX_PAGE_SIZE);

  function writeUrl(next: { page?: number; limit?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.page !== undefined) params.set(pageKey, String(next.page));
    if (next.limit !== undefined) params.set(limitKey, String(next.limit));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setPage(nextPage: number) {
    if (syncUrl) {
      writeUrl({ page: nextPage });
    } else {
      setLocalPage(nextPage);
    }
  }

  function setPageSize(nextSize: number) {
    // Trocar o tamanho da página sempre volta para a primeira página, senão o
    // usuário pode cair numa página inexistente.
    if (syncUrl) {
      writeUrl({ page: 1, limit: nextSize });
    } else {
      setLocalPageSize(nextSize);
      setLocalPage(1);
    }
  }

  /**
   * Reinicia para a página 1. Chame quando um filtro/busca muda (o número de
   * páginas encolhe e a página atual pode deixar de existir).
   */
  function resetToFirstPage() {
    setPage(1);
  }

  /**
   * Traduz o `meta` da API nas props do componente `DataTablePagination`.
   * Passe direto: `<DataTablePagination {...getPaginationProps(data?.meta)} />`.
   */
  function getPaginationProps(meta: PaginationMeta | undefined) {
    const total = meta?.total ?? 0;
    const totalPages = meta?.totalPages ?? 1;
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    return {
      page,
      totalPages,
      from,
      to,
      totalItems: total,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      onPageChange: setPage,
      pageSize,
      onPageSizeChange: setPageSize,
    };
  }

  const queryParams = useMemo(
    () => ({ page, limit: pageSize }),
    [page, pageSize],
  );

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    resetToFirstPage,
    /** `{ page, limit }` pronto para espalhar nos params da query. */
    queryParams,
    getPaginationProps,
  };
}
