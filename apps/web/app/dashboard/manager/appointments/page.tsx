import { PageShell } from "@/app/ui/dashboard/page-shell";
import { ManagementAppointmentsView } from "@/components/appointments/ManagementAppointmentsView";
import { TourButton } from "@/components/tour/TourButton";

export default function ManagerAppointmentsPage() {
  return (
    <PageShell>
      <ManagementAppointmentsView
        canManage
        headerHelp={<TourButton tour="manager-appointments" />}
      />
    </PageShell>
  );
}
