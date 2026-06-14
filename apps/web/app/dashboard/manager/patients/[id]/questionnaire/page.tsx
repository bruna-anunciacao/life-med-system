import VulnerabilityQuestionnaire from "@/components/questionnaire/VulnerabilityQuestionnaire";
import { PageShell } from "@/app/ui/dashboard/page-shell";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ManagerPatientQuestionnairePage({ params }: Props) {
  const { id } = await params;

  return (
    <PageShell>
      <VulnerabilityQuestionnaire mode="manager" patientId={id} />
    </PageShell>
  );
}
