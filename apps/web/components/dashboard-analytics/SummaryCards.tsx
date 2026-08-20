import { StatCard } from "@/components/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardOverview } from "@/services/dashboard-service";

type SummaryCardsProps = {
  data?: DashboardOverview;
  isLoading: boolean;
};

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  if (isLoading || !data) {
    return (
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[68px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard label="Consultas no período" value={data.appointments.total} />
      <StatCard
        label="Atendimentos realizados"
        value={data.care.completedAppointments}
        valueClassName="text-emerald-600"
      />
      <StatCard
        label="Prontuários gerados"
        value={data.care.medicalRecordsCreated}
      />
      <StatCard
        label="Solicitações pendentes"
        value={data.pendingRequests.total}
        valueClassName="text-amber-600"
      />
      <StatCard
        label="Triagens respondidas"
        value={data.questionnaires.totalAnswered}
      />
      <StatCard
        label="Pacientes vulneráveis"
        value={`${data.questionnaires.vulnerablePercentage}%`}
        valueClassName="text-red-600"
      />
    </div>
  );
}
