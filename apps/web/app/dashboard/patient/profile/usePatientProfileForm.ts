import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { usersService } from "../../../../services/users-service";
import { patientProfileSchema, PatientProfileSchema } from "./patient-profile.validation";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  patientProfile?: {
    id: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
  };
};

export function usePatientProfileForm() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<PatientProfileSchema>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      name: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
    },
  });

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await usersService.getUser();
      setUser(data);
      form.reset({
        name: data.name || "",
        phone: data.patientProfile?.phone || "",
        dateOfBirth: data.patientProfile?.dateOfBirth
          ? (data.patientProfile.dateOfBirth.split("T")[0] ?? "")
          : "",
        gender: (data.patientProfile?.gender as PatientProfileSchema["gender"]) || "", 
      });
    } catch {
      toast.error("Erro ao carregar perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = () => {
    if (user) {
      form.reset({
        name: user.name || "",
        phone: user.patientProfile?.phone || "",
        dateOfBirth: user.patientProfile?.dateOfBirth
          ? (String(user.patientProfile.dateOfBirth).split("T")[0] ?? "")
          : "",
        gender: (user.patientProfile?.gender as PatientProfileSchema["gender"]) || "",
      });
    }
    setIsEditing(false);
  };

  const onSubmit = async (values: PatientProfileSchema) => {
    try {
      setIsSaving(true);
      await usersService.updateProfile({
        name: values.name,
        phone: values.phone || undefined,
      });
      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
      await loadProfile();
    } catch {
      toast.error("Erro ao salvar alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  return { user, isLoading, isSaving, isEditing, setIsEditing, form, handleCancel, onSubmit };
}
