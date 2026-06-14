import VulnerabilityQuestionnaire from "@/components/questionnaire/VulnerabilityQuestionnaire";
import { PageShell } from "@/app/ui/dashboard/page-shell";

export default function PatientQuestionnairePage() {
  return (
    <PageShell>
      <VulnerabilityQuestionnaire mode="self" />
    </PageShell>
  );
}
