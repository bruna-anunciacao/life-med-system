import { PageShell } from "@/app/ui/dashboard/page-shell";
import { ManagementAppointmentsView } from "@/components/appointments/ManagementAppointmentsView";

export default function AdminAppointmentsPage() {
  return (
    <PageShell>
      <ManagementAppointmentsView />
    </PageShell>
  );
}
