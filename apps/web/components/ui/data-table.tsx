"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

export function DataTableCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DataTableHeader({
  title,
  count,
  actions,
}: {
  title: string;
  count?: number;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
      <div className="flex items-center gap-2 min-w-0">
        <h2 className="text-base font-semibold text-foreground truncate">{title}</h2>
        {typeof count === "number" && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

export function DataTableToolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 sm:px-6 sm:gap-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DataTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className={cn("w-full text-sm", className)}>{children}</table>
    </div>
  );
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <tr>{children}</tr>
    </thead>
  );
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function DataTableRow({
  className,
  onClick,
  title,
  children,
}: {
  className?: string;
  onClick?: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <tr
      onClick={onClick}
      title={title}
      className={cn(
        "transition-colors hover:bg-muted/30",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </tr>
  );
}

type SortDir = "asc" | "desc";

export function SortableHeader<F extends string>({
  field,
  currentField,
  direction,
  onToggle,
  align = "left",
  className,
  children,
}: {
  field: F;
  currentField: F | null;
  direction: SortDir;
  onToggle: (field: F) => void;
  align?: "left" | "center" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  const isActive = currentField === field;
  const alignClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  return (
    <th
      onClick={() => onToggle(field)}
      title={typeof children === "string" ? `Ordenar por ${children}` : "Ordenar"}
      className={cn(
        "px-6 py-3 cursor-pointer select-none align-middle",
        alignClass,
        className,
      )}
    >
      <span className="inline-flex items-center">
        {children}
        {!isActive && (
          <ArrowUpDown className="ml-1.5 inline h-3.5 w-3.5 text-muted-foreground/50" />
        )}
        {isActive && direction === "asc" && (
          <ArrowUp className="ml-1.5 inline h-3.5 w-3.5 text-foreground" />
        )}
        {isActive && direction === "desc" && (
          <ArrowDown className="ml-1.5 inline h-3.5 w-3.5 text-foreground" />
        )}
      </span>
    </th>
  );
}

export function DataTableHeadCell({
  align = "left",
  className,
  children,
}: {
  align?: "left" | "center" | "right";
  className?: string;
  children?: React.ReactNode;
}) {
  const alignClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  return (
    <th className={cn("px-6 py-3 align-middle", alignClass, className)}>{children}</th>
  );
}

export function DataTableCell({
  align = "left",
  className,
  onClick,
  children,
}: {
  align?: "left" | "center" | "right";
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}) {
  const alignClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  return (
    <td
      onClick={onClick}
      className={cn("px-6 py-3.5 align-middle text-sm text-muted-foreground", alignClass, className)}
    >
      {children}
    </td>
  );
}

export function DataTableLoading({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16">
      <Spinner size="sm" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function DataTableEmpty({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
      {icon && <div className="rounded-full bg-muted p-4 text-muted-foreground/50">{icon}</div>}
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export function DataTableMobileList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-3 space-y-2", className)}>{children}</div>;
}

export function DataTableMobileItem({
  className,
  onClick,
  title,
  children,
}: {
  className?: string;
  onClick?: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/30",
        onClick && "cursor-pointer active:bg-muted/40",
        className,
      )}
    >
      {children}
    </div>
  );
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Props compartilhadas entre o seletor "Por página" (topo) e o rodapé de
 * paginação. Vêm do mesmo lugar — `getPaginationProps(meta)` do
 * `useServerPagination` ou do `usePagination` — então cada peça pega o que
 * precisa e ignora o resto (o spread `{...props}` funciona nos dois).
 */
type PaginationCoreProps = {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  totalItems: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
};

/**
 * Seletor "Por página", pensado para ficar no TOPO da tela (perto do título /
 * busca / filtros), separado do rodapé. Renderiza `null` quando não há como
 * trocar o tamanho da página (sem `onPageSizeChange`). Aceita o mesmo objeto de
 * props do rodapé — os campos extras são ignorados.
 */
export function DataTablePageSizeSelector({
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
}: Pick<
  PaginationCoreProps,
  "pageSize" | "onPageSizeChange" | "pageSizeOptions" | "className"
>) {
  if (typeof pageSize !== "number" || typeof onPageSizeChange !== "function") {
    return null;
  }

  return (
    <label
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <span className="whitespace-nowrap">Por página</span>
      <select
        value={pageSize}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
        aria-label="Itens por página"
        className="h-9 rounded-lg border border-border bg-card px-2 text-xs font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        {pageSizeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Rodapé de paginação: contador "Mostrando X–Y de N" + botões Anterior/Próxima.
 * O seletor "Por página" foi movido para `DataTablePageSizeSelector` (topo da
 * tela) — este componente NÃO renderiza mais o seletor.
 */
export function DataTablePagination({
  page,
  totalPages,
  from,
  to,
  totalItems,
  hasPrev,
  hasNext,
  onPageChange,
  itemLabel = "itens",
  busy = false,
  className,
}: Omit<
  PaginationCoreProps,
  "pageSize" | "onPageSizeChange" | "pageSizeOptions"
> & {
  /**
   * Fetch em andamento (paginação server-side). Desabilita prev/próxima para
   * evitar cliques duplos disparando requests sobrepostos. Sem efeito na
   * paginação client-side, onde a troca de página é síncrona.
   */
  busy?: boolean;
}) {
  // Sem múltiplas páginas não há nada para mostrar no rodapé.
  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">
        Mostrando{" "}
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{" "}
        de <span className="font-medium text-foreground">{totalItems}</span>{" "}
        {itemLabel}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev || busy}
          title="Página anterior"
          aria-label="Página anterior"
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        <span className="px-3 text-xs text-muted-foreground">
          Página <span className="font-medium text-foreground">{page}</span> de{" "}
          <span className="font-medium text-foreground">{totalPages}</span>
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext || busy}
          title="Próxima página"
          aria-label="Próxima página"
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
