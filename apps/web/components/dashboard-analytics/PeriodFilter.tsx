"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PERIOD_PRESET_OPTIONS, type DateRange, type PeriodPreset } from "@/lib/dashboard-period";

type PeriodFilterProps = {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  customRange: DateRange;
  onCustomRangeChange: (range: DateRange) => void;
};

export function PeriodFilter({
  preset,
  onPresetChange,
  customRange,
  onCustomRangeChange,
}: PeriodFilterProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex flex-wrap gap-1.5">
        {PERIOD_PRESET_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onPresetChange(option.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              preset === option.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="dashboard-start-date" className="text-xs text-muted-foreground">
              De
            </Label>
            <Input
              id="dashboard-start-date"
              type="date"
              value={customRange.startDate}
              max={customRange.endDate || undefined}
              onChange={(e) =>
                onCustomRangeChange({ ...customRange, startDate: e.target.value })
              }
              className="h-8 w-auto text-xs"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Label htmlFor="dashboard-end-date" className="text-xs text-muted-foreground">
              Até
            </Label>
            <Input
              id="dashboard-end-date"
              type="date"
              value={customRange.endDate}
              min={customRange.startDate || undefined}
              onChange={(e) =>
                onCustomRangeChange({ ...customRange, endDate: e.target.value })
              }
              className="h-8 w-auto text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
