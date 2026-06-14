import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { usersService } from "@/services/users-service";
import {
  managerProfileSchema,
  type ManagerProfileSchema,
} from "./manager-profile.validation";

type ManagerUser = {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  role: string;
  status: string;
  managerProfile?: {
    id: string;
    phone?: string | null;
    bio?: string | null;
    photoUrl?: string | null;
  } | null;
};

export function useManagerProfileForm() {
  const [user, setUser] = useState<ManagerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ManagerProfileSchema>({
    resolver: zodResolver(managerProfileSchema),
    defaultValues: {
      name: "",
      phone: "",
      bio: "",
    },
  });

  const resetFromUser = (data: ManagerUser) => {
    form.reset({
      name: data.name || "",
      phone: data.managerProfile?.phone || "",
      bio: data.managerProfile?.bio || "",
    });
  };

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await usersService.getUser();
      setUser(data);
      resetFromUser(data);
    } catch {
      toast.error(
        "Não foi possível carregar seus dados do perfil. Recarregue a página.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = () => {
    if (user) resetFromUser(user);
    setIsEditing(false);
  };

  const onSubmit = async (values: ManagerProfileSchema) => {
    try {
      setIsSaving(true);
      await usersService.updateProfile({
        name: values.name,
        phone: values.phone || undefined,
        bio: values.bio || undefined,
      });
      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
      await loadProfile();
    } catch {
      toast.error(
        "Não foi possível salvar as alterações do perfil. Tente novamente.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    user,
    isLoading,
    isSaving,
    isEditing,
    setIsEditing,
    form,
    handleCancel,
    onSubmit,
  };
}
