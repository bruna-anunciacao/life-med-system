import { type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ChartCardProps = {
  title: string;
  description?: string;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
  className?: string;
  height?: number;
};

export function ChartCard({
  title,
  description,
  isLoading,
  isError,
  isEmpty,
  emptyMessage = "Sem dados no período selecionado.",
  children,
  className,
  height = 260,
}: ChartCardProps) {
  return (
    <Card className={cn("bg-card", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {isLoading ? (
          <Skeleton style={{ height }} className="w-full" />
        ) : isError ? (
          <div
            style={{ height }}
            className="flex items-center justify-center text-center text-sm text-muted-foreground"
          >
            Não foi possível carregar este gráfico. Tente novamente.
          </div>
        ) : isEmpty ? (
          <div
            style={{ height }}
            className="flex items-center justify-center text-center text-sm text-muted-foreground"
          >
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
