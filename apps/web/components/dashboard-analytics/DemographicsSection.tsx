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
  CATEGORICAL_COLORS,
  USER_ROLE_LABELS,
  USER_STATUS_COLORS,
  USER_STATUS_LABELS,
} from "@/lib/dashboard-labels";

const AXIS_TICK = { fontSize: 11, fill: "var(--muted-foreground)" };

type DemographicsSectionProps = {
  data?: DashboardOverview;
  isLoading: boolean;
  isError: boolean;
};

export function DemographicsSection({
  data,
  isLoading,
  isError,
}: DemographicsSectionProps) {
  const demographics = data?.demographics;

  const genderData = (demographics?.byGender ?? [])
    .filter((d) => d.count > 0)
    .map((d, index) => ({
      key: d.label,
      name: d.label,
      value: d.count,
      color: CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length],
    }));

  const ageData = (demographics?.byAgeBracket ?? []).map((d) => ({
    label: d.label,
    count: d.count,
  }));
  const ageTotal = ageData.reduce((sum, d) => sum + d.count, 0);

  const roleData = (demographics?.byRole ?? [])
    .filter((d) => d.count > 0)
    .map((d, index) => ({
      key: d.label,
      name: USER_ROLE_LABELS[d.label] ?? d.label,
      value: d.count,
      color: CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length],
    }));

  const statusData = (demographics?.byStatus ?? []).map((d) => ({
    key: d.label,
    label: USER_STATUS_LABELS[d.label] ?? d.label,
    count: d.count,
    color: USER_STATUS_COLORS[d.label] ?? "var(--chart-1)",
  }));
  const statusTotal = statusData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard
        title="Pacientes por gênero"
        description="Distribuição de todos os pacientes cadastrados"
        isLoading={isLoading}
        isError={isError}
        isEmpty={genderData.length === 0}
      >
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={genderData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {genderData.map((entry) => (
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
        title="Pacientes por faixa etária"
        description="Distribuição de todos os pacientes cadastrados"
        isLoading={isLoading}
        isError={isError}
        isEmpty={ageTotal === 0}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={ageData} margin={{ left: -16, right: 12, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
            <XAxis dataKey="label" tick={AXIS_TICK} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
            <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
            <Bar
              dataKey="count"
              name="Pacientes"
              fill="var(--chart-1)"
              radius={[4, 4, 0, 0]}
              barSize={28}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Usuários por papel"
        description="Composição atual da base de usuários"
        isLoading={isLoading}
        isError={isError}
        isEmpty={roleData.length === 0}
      >
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={roleData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {roleData.map((entry) => (
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
        title="Usuários por status"
        description="Composição atual da base de usuários"
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
              width={110}
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="count" name="Usuários" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false}>
              {statusData.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
