import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginSchema, LoginSchema } from "./login.validation";
import { useLoginMutation } from "../../../queries/useLoginMutation";

export function useLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const loginMutation = useLoginMutation();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    loginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: (response) => {
          toast.success(`Bem-vindo(a), ${response.user.name}!`);
          form.reset();
          switch (response.user.role) {
            case "PROFESSIONAL":
              router.push("/dashboard/professional");
              break;
            case "PATIENT":
              router.push("/dashboard/patient");
              break;
            default:
              router.push("/dashboard/admin");
              break;
          }
        },
        onError: (error: any) => {
          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error("Erro desconhecido.");
          }
        },
        onSettled: () => {
          setIsLoading(false);
        },
      }
    );
  };

  return {
    form,
    isLoading,
    isPasswordVisible,
    setIsPasswordVisible,
    onSubmit,
  };
}
