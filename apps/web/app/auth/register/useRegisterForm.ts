"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  registerPatientValidation,
  registerProfessionalValidation,
  type RegisterFormData,
} from "./register-validation";
import { authService } from "../../../services/auth-service";
import * as z from "zod";

const INITIAL_FORM: RegisterFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "PATIENT",
  cpf: "",
  professionalLicense: "",
  phone: "",
  dateOfBirth: null,
  gender: "",
  modality: "VIRTUAL",
  bio: "",
  primarySpecialty: "",
  secondarySpecialty: "",
  socialLinks: { referenceLink: "", instagram: "", other: "" },
};

export function useRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: async (data, context, options) => {
      const schema =
        data.role === "PROFESSIONAL"
          ? registerProfessionalValidation
          : registerPatientValidation;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return zodResolver(schema)(data as any, context, options as any) as any;
    },
    defaultValues: INITIAL_FORM,
    mode: "onSubmit",
  });

  const role = form.watch("role");

  const handleRoleChange = (value: string) => {
    form.reset({ ...INITIAL_FORM, role: value });
  };

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    setIsLoading(true);
    try {
      if (data.role === "PROFESSIONAL") {
        const professional = data as z.infer<
          typeof registerProfessionalValidation
        >;
        const specialitiesArray = [professional.primarySpecialty];
        if (professional.secondarySpecialty) {
          specialitiesArray.push(professional.secondarySpecialty);
        }

        await authService.registerProfessional({
          name: professional.name,
          email: professional.email,
          password: professional.password,
          cpf: professional.cpf.replace(/\D/g, ""),
          professionalLicense: professional.professionalLicense,
          specialty: specialitiesArray,
          bio: professional.bio,
          modality: professional.modality as
            | "VIRTUAL"
            | "HOME_VISIT"
            | "CLINIC",
          socialLinks: professional.socialLinks,
        });
        toast.success(
          "Sua solicitação foi enviada para a administração, aguarde. Sua resposta virá via email.",
        );
      } else {
        const patient = data as z.infer<typeof registerPatientValidation>;
        await authService.registerPatient({
          name: patient.name,
          email: patient.email,
          password: patient.password,
          phone: patient.phone,
          cpf: String(patient.cpf).replace(/\D/g, ""),
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
        });
        toast.success(
          "Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.",
        );
      }

      form.reset(INITIAL_FORM);
      setTimeout(() => router.push("/auth/login"), 1000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro desconhecido.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { form, role, isLoading, handleRoleChange, onSubmit };
}
