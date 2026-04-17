import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "../../../../utils/icons";
import { Check } from "@phosphor-icons/react";
import { env } from "config/env";
import Image from "next/image";
import { useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

type Professional = {
  id: string;
  name: string;
  email: string;
  status: string;
  professionalProfile?: {
    id?: string;
    specialty?: string;
    professionalLicense?: string;
    modality?: string;
    bio?: string;
    photoUrl?: string;
  } | null;
};

const MODALITY_LABEL: Record<string, string> = {
  VIRTUAL: "Remoto",
  HOME_VISIT: "Domiciliar",
  CLINIC: "Presencial",
};

type DoctorCardProps = {
  professional: Professional;
  onViewProfile: () => void;
  onBook: () => void;
};

export function DoctorCard({ professional, onViewProfile, onBook }: DoctorCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const isMobile = useIsMobile();
  const modality = professional.professionalProfile?.modality;
  
  const photoUrl = professional.professionalProfile?.photoUrl;
  const resolvedPhotoUrl = photoUrl
    ? `${env.NEXT_PUBLIC_API_URL}${photoUrl}`
    : null;

  if (isMobile) {
    return (
      <Card className="border border-gray-200 rounded-xl bg-white">
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full shrink-0 overflow-hidden bg-[#006fee] flex items-center justify-center relative">
              {resolvedPhotoUrl && !imageError ? (
                <Image
                  src={resolvedPhotoUrl}
                  alt={`Foto de perfil de ${professional.name}`}
                  fill
                  className="object-cover"
                  sizes="48px"
                  unoptimized
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="text-lg font-semibold text-white">
                  {professional.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {professional.name}
              </h3>
              <p className="text-xs text-gray-500">
                {professional.professionalProfile?.specialty || "Especialidade não informada"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Badge className="px-2 py-0.5 rounded text-[0.65rem] font-semibold">
              {MODALITY_LABEL[modality ?? ""] ?? "Remoto"}
            </Badge>
            {professional.status === "VERIFIED" && (
              <span className="text-xs font-medium">
                Verificado
                <Check className="inline size-2 ml-1" />
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="flex-1 text-xs" onClick={onBook}>
              <CalendarIcon />
              Agendar
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={onViewProfile}>
              Ver Perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              unoptimized
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
              <span className="text-xs font-medium">
                Verificado
                <Check className="inline size-2 ml-1" />
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-row justify-start gap-2 shrink-0">
          <Button size="sm" onClick={onBook}>
            <CalendarIcon />
            Agendar
          </Button>
          <Button size="sm" variant="outline" onClick={onViewProfile}>
            Ver Perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}