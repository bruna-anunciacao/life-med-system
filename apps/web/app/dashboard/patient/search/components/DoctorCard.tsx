"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "../../../../utils/icons";
import { Check } from "@phosphor-icons/react";
import { BookingDialog } from "./BookingDialog";

type Professional = {
  id: string;
  name: string;
  email: string;
  status: string;
  professionalProfile?: {
    id: string;
    specialty: string;
    professionalLicense: string;
    modality?: string;
    bio?: string;
  };
};

const MODALITY_LABEL: Record<string, string> = {
  VIRTUAL: "Remoto",
  HOME_VISIT: "Domiciliar",
  CLINIC: "Presencial",
};

type DoctorCardProps = {
  professional: Professional;
  onViewProfile: () => void;
};

export function DoctorCard({ professional, onViewProfile }: DoctorCardProps) {
  const modality = professional.professionalProfile?.modality;
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="border border-gray-200 rounded-xl bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <CardContent className="p-4 sm:p-6 flex flex-col gap-3 sm:flex-row sm:gap-5 sm:items-center">
          <div className="flex gap-4 flex-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-[#006fee] text-xl sm:text-2xl font-semibold text-white flex-shrink-0">
              {professional.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">{professional.name}</h3>
              <p className="text-sm text-gray-500">
                {professional.professionalProfile?.specialty || "Especialidade não informada"}
              </p>
              {professional.professionalProfile?.professionalLicense && (
                <p className="text-xs text-gray-400">
                  CRM: {professional.professionalProfile.professionalLicense}
                </p>
              )}
              <div className="mt-1 flex flex-wrap gap-2 items-center">
                <Badge className="px-2.5 py-0.5 rounded text-xs font-semibold">
                  {MODALITY_LABEL[modality ?? ""] ?? "Remoto"}
                </Badge>
                {professional.status === "VERIFIED" && (
                  <span className="text-xs font-medium text-[#17c964]">
                    Verificado
                    <Check className="inline size-3 ml-1" />
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-2 sm:flex-col flex-shrink-0">
            <Button
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => setDialogOpen(true)}
            >
              <CalendarIcon />
              Agendar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={onViewProfile}
            >
              Ver Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      <BookingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        professional={{
          id: professional.id,
          name: professional.name,
          specialty: professional.professionalProfile?.specialty ?? "Especialidade não informada",
        }}
      />
    </>
  );
}
