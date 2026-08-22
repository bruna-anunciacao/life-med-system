type TooltipPayloadItem = {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  formatter?: (item: TooltipPayloadItem) => string;
};

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      <div className="flex flex-col gap-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.name}:</span>
            <span className="font-medium text-foreground">
              {formatter ? formatter(item) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
