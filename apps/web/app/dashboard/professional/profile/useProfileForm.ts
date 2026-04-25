"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { usersService } from "../../../../services/users-service";
import { profileSchema, type ProfileSchema } from "./profile.validation";

type ProfessionalProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  professionalProfile?: {
    id: string;
    professionalLicense?: string;
    specialty?: string;
    subspecialty?: string;
    modality?: string;
    bio?: string;
    photoUrl?: string;
    socialLinks?: { referenceLink?: string; instagram?: string; other?: string };
  };
};

export function useProfileForm() {
  const [user, setUser] = useState<ProfessionalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      professionalLicense: "",
      specialty: "",
      subspecialty: "",
      modality: "VIRTUAL",
      bio: "",
      photoUrl: "",
      socialLinks: { referenceLink: "", instagram: "", other: "" },
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await usersService.getUser();
      setUser(response);
      form.reset({
        name: response.name,
        email: response.email,
        professionalLicense: response.professionalProfile?.professionalLicense || "",
        specialty: response.professionalProfile?.specialty || "",
        subspecialty: response.professionalProfile?.subspecialty || "",
        modality: (response.professionalProfile?.modality as "VIRTUAL" | "HOME_VISIT" | "CLINIC") || "VIRTUAL",
        bio: response.professionalProfile?.bio || "",
        photoUrl: response.professionalProfile?.photoUrl || "",
        socialLinks: response.professionalProfile?.socialLinks || { referenceLink: "", instagram: "", other: "" },
      });
    } catch {
      toast.error("Erro ao carregar perfil.");
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  const onSubmit = async (data: ProfileSchema) => {
    try {
      setIsSaving(true);
      await usersService.updateProfile({
        ...data,
        specialty: data.specialty ? [data.specialty] : undefined,
        modality: data.modality as "VIRTUAL" | "HOME_VISIT" | "CLINIC",
        socialLinks: {
          linkedin: data.socialLinks.referenceLink,
          instagram: data.socialLinks.instagram,
          other: data.socialLinks.other,
        },
      });
      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
      setSelectedFile(null);
      await loadProfile();
    } catch {
      toast.error("Erro ao salvar alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        professionalLicense: user.professionalProfile?.professionalLicense || "",
        specialty: user.professionalProfile?.specialty || "",
        subspecialty: user.professionalProfile?.subspecialty || "",
        modality: (user.professionalProfile?.modality as "VIRTUAL" | "HOME_VISIT" | "CLINIC") || "VIRTUAL",
        bio: user.professionalProfile?.bio || "",
        photoUrl: user.professionalProfile?.photoUrl || "",
        socialLinks: user.professionalProfile?.socialLinks || { referenceLink: "", instagram: "", other: "" },
      });
    }
    setIsEditing(false);
  };

  useEffect(() => { loadProfile(); }, [loadProfile]);

  return {
    user,
    form,
    isLoading,
    isSaving,
    isEditing,
    setIsEditing,
    previewUrl,
    selectedFile,
    handleFileChange,
    handleCancel,
    onSubmit,
  };
}
