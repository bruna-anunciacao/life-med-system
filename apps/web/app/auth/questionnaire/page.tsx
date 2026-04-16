import { redirect } from "next/navigation";

export default function AuthQuestionnaireRedirectPage() {
  redirect("/dashboard/patient/questionnaire");
}
