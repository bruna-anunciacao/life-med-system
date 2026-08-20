import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import type { DashboardOverview } from "@/services/dashboard-service";

type PendingRequestsSectionProps = {
  data?: DashboardOverview;
  isLoading: boolean;
  isError: boolean;
};

export function PendingRequestsSection({
  data,
  isLoading,
  isError,
}: PendingRequestsSectionProps) {
  const pending = data?.pendingRequests;
  const total = pending?.total ?? 0;
  const futurePct = total > 0 ? Math.round(((pending?.future ?? 0) / total) * 100) : 0;

  return (
    <Card className="bg-card">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Solicitações pendentes de agendamento
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Consultas com status pendente no momento, separadas por data futura ou vencida
          </p>
        </div>

        {isLoading ? (
          <Skeleton className="h-[132px] w-full" />
        ) : isError ? (
          <div className="flex h-[132px] items-center justify-center text-sm text-muted-foreground">
            Não foi possível carregar este indicador. Tente novamente.
          </div>
        ) : total === 0 ? (
          <div className="flex h-[132px] items-center justify-center text-sm text-muted-foreground">
            Nenhuma solicitação pendente no momento.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Total pendentes" value={total} />
              <StatCard
                label="Futuras"
                value={pending?.future ?? 0}
                valueClassName="text-emerald-600"
              />
              <StatCard
                label="Vencidas"
                value={pending?.overdue ?? 0}
                valueClassName="text-red-600"
              />
            </div>

            <div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-[var(--status-good)]"
                  style={{ width: `${futurePct}%` }}
                />
                <div className="h-full w-0.5 shrink-0 bg-card" />
                <div
                  className="h-full flex-1 bg-[var(--status-critical)]"
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                <span>Futuras ({futurePct}%)</span>
                <span>Vencidas ({100 - futurePct}%)</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
