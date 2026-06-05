"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
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
