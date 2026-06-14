import { useQuery } from "@tanstack/react-query";
import {
  ListAppointmentsParams,
  managerService,
} from "../services/manager-service";

export function useListAppointmentsQuery(params?: ListAppointmentsParams) {
  return useQuery({
    queryKey: ["appointments", params ?? {}],
    queryFn: () => managerService.listAppointments(params),
  });
}
