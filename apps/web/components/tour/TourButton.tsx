"use client";

import { CircleHelp } from "lucide-react";
import { useNextStep } from "nextstepjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TourButtonProps = {
  /** Nome do tour a iniciar, ex.: "patient-home" (deve existir em tours.tsx). */
  tour: string;
  /** Rótulo do botão. */
  label?: string;
  /**
   * Quando true, mostra só o ícone em qualquer viewport.
   * Por padrão (false), o rótulo é ocultado apenas no mobile via CSS — sem
   * precisar do hook useIsMobile, o que permite usar este botão em páginas
   * server-side também.
   */
  iconOnly?: boolean;
  className?: string;
};

/**
 * Botão "Ajuda" que dispara o tour guiado da tela atual.
 * Posicione no slot `help` do PageHeader.
 */
export function TourButton({
  tour,
  label = "Ajuda",
  iconOnly = false,
  className,
}: TourButtonProps) {
  const { startNextStep } = useNextStep();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => startNextStep(tour)}
      title="Ver tutorial desta tela"
      aria-label="Ver tutorial desta tela"
      className={cn(iconOnly ? "size-8 p-0" : "max-sm:size-8 max-sm:p-0", className)}
    >
      <CircleHelp size={16} />
      {!iconOnly && <span className="max-sm:hidden">{label}</span>}
    </Button>
  );
}
