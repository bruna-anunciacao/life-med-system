import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginSchema, LoginSchema } from "./login.validation";
import { useLoginMutation } from "../../../queries/useLoginMutation";

const DASHBOARD_ROUTES: Record<string, string> = {
  PROFESSIONAL: "/dashboard/professional",
  PATIENT: "/dashboard/patient",
  ADMIN: "/dashboard/admin",
  MANAGER: "/dashboard/manager",
};

function getPatientRoute(response: {
  user: {
    patientProfile?: {
      questionnaireCompleted: boolean;
      approvalStatus: "APPROVED" | "PENDING" | "REJECTED";
    } | null;
  };
}) {
  const profile = response.user.patientProfile;
  if (!profile?.questionnaireCompleted) {
    return "/dashboard/patient/questionnaire";
  }
  if (profile.approvalStatus === "PENDING") {
    return "/auth/patient-pending-approval";
  }
  if (profile.approvalStatus === "REJECTED") {
    return "/auth/patient-rejected";
  }
  return "/dashboard/patient";
}

export function useLoginForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();
  const loginMutation = useLoginMutation();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginSchema) => {
    loginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: (response) => {
          toast.success(`Bem-vindo(a), ${response.user.name}!`);
          form.reset();
          const route =
            response.user.role === "PATIENT"
              ? getPatientRoute(response)
              : (DASHBOARD_ROUTES[response.user.role] ?? "/dashboard/admin");
          router.push(route);
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Erro desconhecido.";

          // Etapa 2: e-mail confirmado, mas falta aprovação do administrador.
          if (message.includes("aguarda aprovação do administrador")) {
            toast.info(message);
            router.push("/auth/pending-approval");
            return;
          }

          // Etapa 1: e-mail ainda não confirmado.
          if (message.includes("ainda não foi verificado")) {
            toast.info(message);
            router.push("/auth/verify-email-pending");
            return;
          }

          toast.error(message);
        },
      },
    );
  };

  return {
    form,
    isLoading: loginMutation.isPending,
    isPasswordVisible,
    setIsPasswordVisible,
    onSubmit,
  };
}
