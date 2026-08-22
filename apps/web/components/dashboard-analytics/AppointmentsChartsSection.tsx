"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import type { DashboardOverview } from "@/services/dashboard-service";
import {
  APPOINTMENT_MODALITY_LABELS,
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
  CATEGORICAL_COLORS,
} from "@/lib/dashboard-labels";

const AXIS_TICK = { fontSize: 11, fill: "var(--muted-foreground)" };
const MAX_SPECIALITIES = 8;

type AppointmentsChartsSectionProps = {
  data?: DashboardOverview;
  isLoading: boolean;
  isError: boolean;
};

export function AppointmentsChartsSection({
  data,
  isLoading,
  isError,
}: AppointmentsChartsSectionProps) {
  const statusData = data
    ? Object.entries(data.appointments.byStatus).map(([key, count]) => ({
        key,
        label: APPOINTMENT_STATUS_LABELS[key] ?? key,
        count,
        color: APPOINTMENT_STATUS_COLORS[key] ?? "var(--chart-1)",
      }))
    : [];
  const statusTotal = statusData.reduce((sum, d) => sum + d.count, 0);

  const modalityData = data
    ? Object.entries(data.appointments.byModality)
        .map(([key, count], index) => ({
          key,
          name: APPOINTMENT_MODALITY_LABELS[key] ?? key,
          value: count,
          color: CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length],
        }))
        .filter((d) => d.value > 0)
    : [];

  const specialityRaw = data?.appointments.bySpeciality ?? [];
  const specialityTop = specialityRaw.slice(0, MAX_SPECIALITIES);
  const specialityOthersCount = specialityRaw
    .slice(MAX_SPECIALITIES)
    .reduce((sum, s) => sum + s.count, 0);
  const specialityData = [
    ...specialityTop.map((s) => ({ label: s.label, count: s.count })),
    ...(specialityOthersCount > 0
      ? [{ label: "Outras", count: specialityOthersCount }]
      : []),
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard
        title="Consultas por status"
        description="Distribuição das consultas no período selecionado"
        isLoading={isLoading}
        isError={isError}
        isEmpty={statusTotal === 0}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={statusData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
            <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="0" />
            <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
            <YAxis
              type="category"
              dataKey="label"
              width={92}
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="count" name="Consultas" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false}>
              {statusData.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Consultas por modalidade"
        description="Virtual vs. atendimento presencial"
        isLoading={isLoading}
        isError={isError}
        isEmpty={modalityData.length === 0}
      >
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={modalityData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {modalityData.map((entry) => (
                <Cell key={entry.key} fill={entry.color} stroke="var(--card)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Consultas por especialidade"
        description="Top especialidades com mais consultas no período"
        isLoading={isLoading}
        isError={isError}
        isEmpty={specialityData.length === 0}
        className="lg:col-span-2"
        height={Math.max(220, specialityData.length * 36)}
      >
        <ResponsiveContainer width="100%" height={Math.max(220, specialityData.length * 36)}>
          <BarChart
            data={specialityData}
            layout="vertical"
            margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
          >
            <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="0" />
            <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
            <YAxis
              type="category"
              dataKey="label"
              width={140}
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
            <Bar
              dataKey="count"
              name="Consultas"
              fill="var(--chart-1)"
              radius={[0, 4, 4, 0]}
              barSize={18}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
