import { PageShell } from "@/app/ui/dashboard/page-shell";
import { ManagementAppointmentsView } from "@/components/appointments/ManagementAppointmentsView";
import { TourButton } from "@/components/tour/TourButton";

export default function AdminAppointmentsPage() {
  return (
    <PageShell>
      <ManagementAppointmentsView headerHelp={<TourButton tour="admin-appointments" />} />
    </PageShell>
  );
}
