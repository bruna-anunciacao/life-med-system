import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "../../../../utils/icons";
import { Check } from "@phosphor-icons/react";
import { env } from "config/env";
import Image from "next/image";
import { useState } from "react";

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
    photoUrl?: string;
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
  const [imageError, setImageError] = useState(false);

  const modality = professional.professionalProfile?.modality;

  const photoUrl = professional.professionalProfile?.photoUrl;
  const resolvedPhotoUrl = photoUrl
    ? `${env.NEXT_PUBLIC_API_URL}${photoUrl}`
    : null;

  return (
    <Card className="border border-gray-200 rounded-xl bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <CardContent className="p-6 flex gap-5">
        <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-[#006fee] text-2xl font-semibold text-white flex-shrink-0 overflow-hidden">
          
          {resolvedPhotoUrl && !imageError ? (
            <Image
              src={resolvedPhotoUrl}
              alt={`Foto de perfil de ${professional.name}`}
              fill
              className="object-cover"
              sizes="64px"
              priority
              unoptimized={process.env.NODE_ENV === "development"}
              // Gatilho que ativa caso o backend retorne 404
              onError={() => setImageError(true)} 
            />
          ) : (
            professional.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 flex flex-col gap-1.5">
          <h3 className="text-lg font-semibold text-gray-900">
            {professional.name}
          </h3>
          <p className="text-sm text-gray-500">
            {professional.professionalProfile?.specialty ||
              "Especialidade não informada"}
          </p>
          {professional.professionalProfile?.professionalLicense && (
            <p className="text-xs text-gray-400">
              CRM: {professional.professionalProfile.professionalLicense}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <Badge className="px-2.5 py-0.5 rounded text-xs font-semibold">
              {MODALITY_LABEL[modality ?? ""] ?? "Remoto"}
            </Badge>
            {professional.status === "VERIFIED" && (
              <>
                <span className="text-xs font-medium">
                  Verificado
                  <Check className="inline size-2 ml-1" />
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-row justify-start gap-2 flex-shrink-0">
          <Button
            size="sm"
            className="px-5 py-2 rounded-lg bg-[#006fee] font-semibold text-sm text-white cursor-pointer transition-all duration-200 hover:bg-[#0056b3]"
          >
            <CalendarIcon />
            Agendar
          </Button>
          <Button
            size="sm"
            onClick={onViewProfile}
            className="px-5 py-2 border border-gray-200 rounded-lg bg-white font-semibold text-sm text-gray-700 cursor-pointer transition-all duration-200 hover:bg-gray-50"
          >
            Ver Perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}