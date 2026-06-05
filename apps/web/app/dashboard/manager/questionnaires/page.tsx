"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QuestionnaireManager } from "@/components/questionnaire/QuestionnaireManager";
import { PageShell } from "../../../ui/dashboard/page-shell";

export default function ManagerQuestionnairePage() {
  return (
    <PageShell>
      <Link
        href="/dashboard/manager"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Painel do Gestor
      </Link>
      <QuestionnaireManager />
    </PageShell>
  );
}
