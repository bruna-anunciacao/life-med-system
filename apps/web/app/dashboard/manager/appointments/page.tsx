import { PageShell } from "@/app/ui/dashboard/page-shell";
import { ManagementAppointmentsView } from "@/components/appointments/ManagementAppointmentsView";

export default function ManagerAppointmentsPage() {
  return (
    <PageShell>
      <ManagementAppointmentsView canManage />
    </PageShell>
  );
}
