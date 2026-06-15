"use client";

import type { CardComponentProps } from "nextstepjs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/**
 * Card (tooltip) customizado do tour, usando a identidade visual do LifeMed.
 * Substitui o card padrão do NextStepjs via prop `cardComponent`.
 */
export function TourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: CardComponentProps) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="relative box-border w-[17rem] max-w-[calc(100vw-1.5rem)] rounded-xl bg-white p-4 text-sm shadow-lg ring-1 ring-black/10 sm:w-[19rem]">
      {arrow}

      <div className="mb-2 flex items-start justify-between gap-2">
        <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold leading-snug text-foreground">
          {step.icon && (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 [&_svg]:size-4">
              {step.icon}
            </span>
          )}
          <span className="min-w-0 break-words">{step.title}</span>
        </h2>
        <button
          type="button"
          onClick={() => skipTour?.()}
          aria-label="Fechar tutorial"
          className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mb-4 text-sm leading-relaxed text-slate-600">
        {step.content}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400">
          Passo {currentStep + 1} de {totalSteps}
        </span>

        <div className="flex items-center gap-2">
          {!isFirst && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => prevStep?.()}
              className="gap-1"
            >
              <ChevronLeft size={14} />
              Anterior
            </Button>
          )}
          <Button size="sm" onClick={() => nextStep?.()} className="gap-1">
            {isLast ? "Concluir" : "Próximo"}
            {!isLast && <ChevronRight size={14} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
