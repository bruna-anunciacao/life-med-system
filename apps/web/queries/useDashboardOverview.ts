import { useQuery } from "@tanstack/react-query";
import {
  dashboardService,
  type DashboardOverviewParams,
} from "@/services/dashboard-service";

export function useDashboardOverviewQuery(params: DashboardOverviewParams) {
  return useQuery({
    queryKey: ["dashboardOverview", params],
    queryFn: () => dashboardService.getOverview(params),
    placeholderData: (previousData) => previousData,
  });
}
