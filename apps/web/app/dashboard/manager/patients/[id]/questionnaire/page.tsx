import VulnerabilityQuestionnaire from "@/components/questionnaire/VulnerabilityQuestionnaire";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ManagerPatientQuestionnairePage({ params }: Props) {
  const { id } = await params;

  return <VulnerabilityQuestionnaire mode="manager" patientId={id} />;
}
