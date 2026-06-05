"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SpecialitiesTable } from "../components/SpecialityTable";
import { useSpecialitiesQuery } from "@/queries/useSpecialitiesQuery";
import { LoadingPage } from "@/components/shared/LoadingPage";
import { PageShell } from "../../../ui/dashboard/page-shell";

export default function SpecialidadesPage() {
  const { data: specialities = [], isLoading } = useSpecialitiesQuery();

  if (isLoading) return <LoadingPage />;

  return (
    <PageShell>
      <Link
        href="/dashboard/admin"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Painel Administrativo
      </Link>

      <SpecialitiesTable specialities={specialities} />
    </PageShell>
  );
}
