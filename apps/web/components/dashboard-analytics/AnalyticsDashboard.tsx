"use client";

import { useMemo, useState } from "react";
import { PageHeader, PageShell } from "@/app/ui/dashboard/page-shell";
import { useDashboardOverviewQuery } from "@/queries/useDashboardOverview";
import { resolvePeriodRange, type DateRange, type PeriodPreset } from "@/lib/dashboard-period";
import { PeriodFilter } from "./PeriodFilter";
import { SummaryCards } from "./SummaryCards";
import { AppointmentsChartsSection } from "./AppointmentsChartsSection";
import { AppointmentsTimelineSection } from "./AppointmentsTimelineSection";
import { PendingRequestsSection } from "./PendingRequestsSection";
import { QuestionnaireSection } from "./QuestionnaireSection";
import { DemographicsSection } from "./DemographicsSection";

export function AnalyticsDashboard() {
  const [preset, setPreset] = useState<PeriodPreset>("30d");
  const [customRange, setCustomRange] = useState<DateRange>(() =>
    resolvePeriodRange("30d"),
  );

  const range = useMemo(
    () => resolvePeriodRange(preset, customRange),
    [preset, customRange],
  );

  const isCustomRangeIncomplete =
    preset === "custom" && (!customRange.startDate || !customRange.endDate);

  const { data, isLoading, isError, isFetching } = useDashboardOverviewQuery({
    startDate: isCustomRangeIncomplete ? undefined : range.startDate,
    endDate: isCustomRangeIncomplete ? undefined : range.endDate,
  });

  const showLoading = isLoading || (isFetching && !data);

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description="Indicadores de consultas, atendimentos, solicitações, triagens e demografia."
      />

      <PeriodFilter
        preset={preset}
        onPresetChange={setPreset}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
      />

      <SummaryCards data={data} isLoading={showLoading} />

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">Consultas</h2>
          <div className="flex flex-col gap-4">
            <AppointmentsChartsSection data={data} isLoading={showLoading} isError={isError} />
            <AppointmentsTimelineSection data={data} isLoading={showLoading} isError={isError} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">Solicitações</h2>
          <PendingRequestsSection data={data} isLoading={showLoading} isError={isError} />
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">Triagens</h2>
          <QuestionnaireSection data={data} isLoading={showLoading} isError={isError} />
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">Demografia</h2>
          <DemographicsSection data={data} isLoading={showLoading} isError={isError} />
        </section>
      </div>
    </PageShell>
  );
}
