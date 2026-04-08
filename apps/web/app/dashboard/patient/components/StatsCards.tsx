import { Card, CardContent } from "@/components/ui/card";
import { StatItem } from "../patient-dashboard.types";

type StatsCardsProps = {
  stats: StatItem[];
  isMobile: boolean;
};

export function StatsCards({ stats, isMobile }: StatsCardsProps) {
  return (
    <div
      className={`flex h-full gap-2 ${isMobile ? "flex-row" : "flex-col"}`}
    >
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="flex-1 border border-gray-200 py-0 gap-0"
        >
          <CardContent
            className={`flex h-full items-center gap-3 ${isMobile ? "px-3 py-2" : "px-4 py-3"}`}
          >
            <div
              className={`flex shrink-0 items-center justify-center rounded-lg ${stat.colorClass} ${isMobile ? "size-7" : "size-8"}`}
            >
              {stat.icon}
            </div>
            <div>
              <p
                className={`text-gray-400 ${isMobile ? "text-[0.6rem]" : "text-xs"}`}
              >
                {stat.title}
              </p>
              <p
                className={`font-bold leading-tight text-gray-900 ${isMobile ? "text-lg" : "text-xl"}`}
              >
                {stat.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
