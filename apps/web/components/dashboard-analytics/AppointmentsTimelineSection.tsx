"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import type { DashboardOverview } from "@/services/dashboard-service";

const AXIS_TICK = { fontSize: 11, fill: "var(--muted-foreground)" };

const formatDay = (isoDate: string) => {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
};

const formatMonth = (isoMonth: string) => {
  const [year, month] = isoMonth.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
};

type AppointmentsTimelineSectionProps = {
  data?: DashboardOverview;
  isLoading: boolean;
  isError: boolean;
};

export function AppointmentsTimelineSection({
  data,
  isLoading,
  isError,
}: AppointmentsTimelineSectionProps) {
  const dailyData = (data?.appointments.dailySeries ?? []).map((d) => ({
    date: formatDay(d.date),
    count: d.count,
  }));

  const monthlyData = (data?.appointments.monthlySeries ?? []).map((m) => ({
    month: formatMonth(m.month),
    count: m.count,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard
        title="Evolução diária"
        description="Consultas agendadas por dia no período"
        isLoading={isLoading}
        isError={isError}
        isEmpty={dailyData.length === 0}
      >
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={dailyData} margin={{ left: -16, right: 12, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
            <XAxis
              dataKey="date"
              tick={AXIS_TICK}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />
            <Line
              type="monotone"
              dataKey="count"
              name="Consultas"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Consolidado por mês"
        description="Total de consultas agrupadas por mês"
        isLoading={isLoading}
        isError={isError}
        isEmpty={monthlyData.length === 0}
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} margin={{ left: -16, right: 12, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
            <XAxis dataKey="month" tick={AXIS_TICK} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
            <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
            <Bar
              dataKey="count"
              name="Consultas"
              fill="var(--chart-1)"
              radius={[4, 4, 0, 0]}
              barSize={28}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
