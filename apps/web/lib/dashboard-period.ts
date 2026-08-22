export type PeriodPreset = "7d" | "30d" | "90d" | "currentMonth" | "custom";

export interface DateRange {
  startDate: string;
  endDate: string;
}

const toISODate = (date: Date): string => date.toISOString().slice(0, 10);

export const PERIOD_PRESET_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
  { value: "currentMonth", label: "Mês atual" },
  { value: "custom", label: "Personalizado" },
];

export function resolvePeriodRange(preset: PeriodPreset, custom?: DateRange): DateRange {
  const now = new Date();

  if (preset === "custom" && custom?.startDate && custom?.endDate) {
    return custom;
  }

  if (preset === "currentMonth") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: toISODate(start), endDate: toISODate(now) };
  }

  const days = preset === "7d" ? 7 : preset === "90d" ? 90 : 30;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return { startDate: toISODate(start), endDate: toISODate(now) };
}
