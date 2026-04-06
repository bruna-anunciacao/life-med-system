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
};

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
            DASHBOARD_ROUTES[response.user.role] ?? "/dashboard/admin";
          router.push(route);
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Erro desconhecido.";

          if (message.includes("ainda não foi aprovada")) {
            toast.info(message);
            router.push("/auth/pending-approval");
            return;
          }

          if (message.includes("e-mail ainda não foi verificado")) {
            toast.info(message);
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
