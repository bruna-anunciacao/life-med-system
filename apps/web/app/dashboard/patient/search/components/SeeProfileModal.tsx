"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Video,
  Home,
  CreditCard,
  Stethoscope,
  ExternalLink,
  CalendarDays,
} from "lucide-react";
import Image from "next/image";
import { BookingModal } from "./BookingModal";
import { env } from "@/config/env";

export interface ProfessionalData {
  id: string;
  name: string;
  email: string;
  professionalProfile?: {
    professionalLicense: string;
    specialities?: { id: string; name: string }[];
    modality: "VIRTUAL" | "HOME_VISIT" | "CLINIC";
    bio?: string | null;
    photoUrl?: string | null;
    price?: number | null;
    payments?: string[] | null;
    socialLinks?: {
      linkedin?: string;
      instagram?: string;
      other?: string;
    } | null;
  } | null;
}

interface SeeProfileModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  professional?: ProfessionalData | null;
}

const getModalityInfo = (modality?: string) => {
  switch (modality) {
    case "VIRTUAL":
      return {
        text: "Atendimento Online",
        icon: <Video className="w-5 h-5 text-blue-600" />,
      };
    case "HOME_VISIT":
      return {
        text: "Atendimento Domiciliar",
        icon: <Home className="w-5 h-5 text-blue-600" />,
      };
    case "CLINIC":
      return {
        text: "Atendimento Presencial",
        icon: <MapPin className="w-5 h-5 text-blue-600" />,
      };
    default:
      return {
        text: "Modalidade não informada",
        icon: <Video className="w-5 h-5 text-gray-400" />,
      };
  }
};

const getPaymentName = (method: string) => {
  const methods: Record<string, string> = {
    pix: "Pix",
    credit_card: "Cartão de Crédito",
    cash: "Dinheiro",
    health_insurance: "Convênio",
    free: "Gratuito",
  };
  return methods[method] || method;
};

export function SeeProfileModal({
  isOpen,
  onOpenChange,
  professional,
}: SeeProfileModalProps) {
  const [imageError, setImageError] = useState(false);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleBookingSuccess = () => {
    setIsBookingModalOpen(false);
    onOpenChange(false);
  };

  if (!professional || !professional.professionalProfile) return null;

  const { professionalProfile: profile } = professional;
  const modalityInfo = getModalityInfo(profile.modality);

  const hasPrice = profile.price !== null && profile.price !== undefined;
  const hasPayments = profile.payments && profile.payments.length > 0;
  const hasFinancialInfo = hasPrice || hasPayments;

  const hasValidSocialLinks =
    profile.socialLinks &&
    (!!profile.socialLinks.instagram ||
      !!profile.socialLinks.linkedin ||
      !!profile.socialLinks.other);

  const resolvedPhotoUrl = profile.photoUrl
    ? `${env.NEXT_PUBLIC_API_URL}${profile.photoUrl}`
    : null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full p-6 flex flex-col overflow-auto rounded-2xl bg-white text-black mx-auto">
            <DialogHeader className="flex flex-col items-center text-center mb-6">
              <h2 className="text-2xl font-semibold">Perfil do Profissional</h2>
              <p className="text-sm text-gray-500 mt-1">
                Visualize as informações detalhadas e formas de atendimento.
              </p>
            </DialogHeader>

            <div className="gap-6 pb-2">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-[#006fee] text-2xl font-semibold text-white flex-shrink-0 overflow-hidden">
                  {resolvedPhotoUrl && !imageError ? (
                    <Image
                      src={resolvedPhotoUrl}
                      alt={`Foto de perfil de ${professional.name}`}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    professional.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex flex-col items-center sm:items-start flex-1 mt-2">
                  <h3 className="text-2xl font-bold text-gray-900 text-center sm:text-left">
                    {professional.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full text-sm">
                    <Stethoscope className="w-4 h-4" />
                    <span>{profile.specialities?.[0]?.name || "Especialidade não informada"}</span>
                  </div>
                  <div className="mt-3 text-[0.85rem] text-[#8a91a0] bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                    <span className="font-medium text-gray-600">Registro:</span>{" "}
                    {profile.professionalLicense}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {profile.bio && (
                <>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                      Sobre o profissional
                    </h3>
                    <p className="text-[0.9rem] text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-100">
                      {profile.bio}
                    </p>
                  </div>
                  <Separator className="my-6" />
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    Local de Atendimento
                  </h3>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 h-full min-h-[90px]">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100 shrink-0">
                      {modalityInfo.icon}
                    </div>
                    <div className="flex flex-col">
                      <p className="font-semibold text-gray-900 text-[0.95rem]">
                        {modalityInfo.text}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    Valores e Pagamento
                  </h3>
                  <div className="flex flex-col justify-center gap-2.5 bg-gray-50 p-4 rounded-xl border border-gray-100 h-full min-h-[90px]">
                    {!hasFinancialInfo ? (
                      <p className="text-[0.9rem] text-gray-500 italic">
                        Informações não cadastradas.
                      </p>
                    ) : (
                      <>
                        {hasPrice && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 text-[0.95rem]">
                              Consulta:
                            </span>
                            <span className="text-blue-600 font-bold text-[1.05rem]">
                              {profile.price!.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          </div>
                        )}

                        {hasPayments && (
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
                            <div className="flex flex-wrap gap-1.5">
                              {profile.payments!.map((method) => (
                                <span
                                  key={method}
                                  className="bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md text-[0.8rem] font-medium shadow-sm"
                                >
                                  {getPaymentName(method)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {hasValidSocialLinks && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="text-base font-semibold mb-3">
                      Redes Sociais e Links
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.socialLinks!.instagram && (
                        <a
                          href={profile.socialLinks!.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[0.85rem] text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-pink-600" />
                          Instagram
                        </a>
                      )}
                      {profile.socialLinks!.linkedin && (
                        <a
                          href={profile.socialLinks!.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[0.85rem] text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-700" />
                          LinkedIn
                        </a>
                      )}
                      {profile.socialLinks!.other && (
                        <a
                          href={profile.socialLinks!.other}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[0.85rem] text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-6 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200"
              >
                Fechar
              </Button>
              <Button
                onClick={() => setIsBookingModalOpen(true)}
                className="px-6 py-2 rounded-lg bg-[#006fee] font-semibold text-sm text-white cursor-pointer hover:bg-[#005bc4] transition-all shadow-sm flex items-center gap-2"
              >
                <CalendarDays className="w-4 h-4" />
                Agendar Consulta
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <BookingModal
        isOpen={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        onSuccess={handleBookingSuccess}
        professional={professional}
      />
    </>
  );
}

export default SeeProfileModal;
