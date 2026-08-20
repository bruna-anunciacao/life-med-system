"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import type { DashboardOverview } from "@/services/dashboard-service";
import {
  CATEGORICAL_COLORS,
  QUESTIONNAIRE_ANSWERED_BY_LABELS,
} from "@/lib/dashboard-labels";

type QuestionnaireSectionProps = {
  data?: DashboardOverview;
  isLoading: boolean;
  isError: boolean;
};

export function QuestionnaireSection({
  data,
  isLoading,
  isError,
}: QuestionnaireSectionProps) {
  const questionnaires = data?.questionnaires;

  const answeredByData = questionnaires
    ? Object.entries(questionnaires.byAnsweredBy)
        .map(([key, count], index) => ({
          key,
          name: QUESTIONNAIRE_ANSWERED_BY_LABELS[key] ?? key,
          value: count,
          color: CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length],
        }))
        .filter((d) => d.value > 0)
    : [];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
      <Card className="bg-card">
        <CardContent className="flex flex-col justify-center gap-4 p-4 sm:p-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Triagens de vulnerabilidade
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Questionários respondidos no período selecionado
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total respondidas" value={questionnaires?.totalAnswered ?? 0} />
            <StatCard
              label="Classificadas vulneráveis"
              value={
                questionnaires
                  ? `${questionnaires.vulnerableCount} (${questionnaires.vulnerablePercentage}%)`
                  : 0
              }
              valueClassName="text-red-600"
            />
          </div>
        </CardContent>
      </Card>

      <ChartCard
        title="Quem respondeu"
        description="Paciente vs. gestor (cadastro assistido)"
        isLoading={isLoading}
        isError={isError}
        isEmpty={answeredByData.length === 0}
        height={220}
      >
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={answeredByData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {answeredByData.map((entry) => (
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
    </div>
  );
}
