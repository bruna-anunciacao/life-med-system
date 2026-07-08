/**
 * Contrato padrão de paginação server-side.
 *
 * Todo endpoint paginado da API responde com este envelope:
 *
 *   { data: T[], meta: { page, limit, total, totalPages } }
 *
 * `totalPages` é sempre >= 1 (mesmo com `total = 0`), então nunca precisamos
 * recalcular `Math.ceil(total / limit)` no front — basta ler de `meta`.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Opções de tamanho de página padrão em toda a aplicação (máx. 100 na API). */
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const DEFAULT_PAGE_SIZE = 10;

/**
 * Limite máximo aceito pela API (ver list-*-query.dto.ts no server). Usado por
 * telas que ainda filtram/ordenam a lista inteira no cliente e precisam puxar o
 * máximo de registros de uma vez, sem paginação real.
 */
export const MAX_PAGE_SIZE = 100;

/** Envelope vazio, útil como fallback enquanto a query carrega. */
export function emptyPage<T>(limit: number = DEFAULT_PAGE_SIZE): Paginated<T> {
  return { data: [], meta: { page: 1, limit, total: 0, totalPages: 1 } };
}
