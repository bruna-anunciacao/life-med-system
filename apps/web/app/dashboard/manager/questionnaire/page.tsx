"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QuestionnaireManager } from "@/components/questionnaire/QuestionnaireManager";

export default function ManagerQuestionnairePage() {
  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6">
      <Link
        href="/dashboard/manager"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Painel do Gestor
      </Link>
      <QuestionnaireManager />
    </div>
  );
}
