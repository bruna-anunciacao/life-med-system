import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  help,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Botão de ajuda/tutorial: fica sempre ao lado do título, no canto superior direito. */
  help?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {help && <div className="shrink-0 sm:hidden">{help}</div>}
      </div>
      {(actions || help) && (
        <div className="flex shrink-0 items-center justify-end gap-2">
          {actions}
          {help && <div className="hidden sm:block">{help}</div>}
        </div>
      )}
    </div>
  );
}
