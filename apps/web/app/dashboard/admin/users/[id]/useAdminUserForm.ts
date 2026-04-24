"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { usersService, type UpdateProfileDto } from "../../../../../services/users-service";
import { useSpecialitiesQuery } from "@/queries/useSpecialitiesQuery";
import {
  patientFormSchema,
  professionalFormSchema,
  type PatientFormSchema,
  type ProfessionalFormSchema,
} from "./admin-user.validation";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  patientProfile?: {
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    cpf?: string;
  };
  professionalProfile?: {
    professionalLicense?: string;
    specialities?: { id: string; name: string }[];
    modality?: string;
    bio?: string;
    photoUrl?: string;
    socialLinks?: { linkedin?: string; instagram?: string };
  };
};

export function useAdminUserForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: specialities = [] } = useSpecialitiesQuery();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patientForm = useForm<PatientFormSchema>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: { name: "", email: "", status: "", phone: "", dateOfBirth: "", gender: "", address: "", cpf: "" },
  });

  const professionalForm = useForm<ProfessionalFormSchema>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: { name: "", email: "", status: "", professionalLicense: "", specialityId: "", modality: "", bio: "", linkedin: "", instagram: "" },
  });

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await usersService.getUserById(id);
      if (!data) { setError("Usuário não encontrado."); return; }
      setUser(data);

      if (data.role === "PATIENT") {
        patientForm.reset({
          name: data.name || "",
          email: data.email || "",
          status: data.status || "",
          phone: data.patientProfile?.phone || "",
          dateOfBirth: data.patientProfile?.dateOfBirth?.split("T")[0] || "",
          gender: data.patientProfile?.gender || "",
          address: data.patientProfile?.address || "",
          cpf: data.patientProfile?.cpf || "",
        });
      } else {
        professionalForm.reset({
          name: data.name || "",
          email: data.email || "",
          status: data.status || "",
          professionalLicense: data.professionalProfile?.professionalLicense || "",
          specialityId: data.professionalProfile?.specialities?.[0]?.id || "",
          modality: data.professionalProfile?.modality || "",
          bio: data.professionalProfile?.bio || "",
          linkedin: data.professionalProfile?.socialLinks?.linkedin || "",
          instagram: data.professionalProfile?.socialLinks?.instagram || "",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar perfil do usuário.";
      toast.error(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { setIsEditing(searchParams.get("edit") === "1"); }, [searchParams]);
  useEffect(() => { void loadProfile(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmitPatient = async (data: PatientFormSchema) => {
    if (!user) return;
    try {
      setIsSaving(true);
      await usersService.updateUser(user.id, {
        name: data.name,
        email: data.email,
        status: data.status as UpdateProfileDto["status"],
        phone: data.phone || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender || undefined,
        address: data.address || undefined,
        cpf: data.cpf || undefined,
      });
      toast.success("Dados do usuário atualizados com sucesso.");
      setIsEditing(false);
      await loadProfile();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar dados do usuário.");
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitProfessional = async (data: ProfessionalFormSchema) => {
    if (!user) return;
    try {
      setIsSaving(true);
      await usersService.updateUser(user.id, {
        name: data.name,
        email: data.email,
        status: data.status as UpdateProfileDto["status"],
        professionalLicense: data.professionalLicense || undefined,
        specialty: data.specialityId ? [data.specialityId] : undefined,
        modality: (data.modality || undefined) as UpdateProfileDto["modality"],
        bio: data.bio || undefined,
        socialLinks: {
          linkedin: data.linkedin || undefined,
          instagram: data.instagram || undefined,
        },
      });
      toast.success("Dados do usuário atualizados com sucesso.");
      setIsEditing(false);
      await loadProfile();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar dados do usuário.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      if (user.role === "PATIENT") patientForm.reset();
      else professionalForm.reset();
    }
    setIsEditing(false);
  };

  return {
    user,
    isLoading,
    isSaving,
    isEditing,
    setIsEditing,
    error,
    router,
    patientForm,
    professionalForm,
    specialities,
    handleCancel,
    onSubmitPatient,
    onSubmitProfessional,
  };
}
