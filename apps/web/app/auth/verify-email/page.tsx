"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVerifyEmailQuery } from "../../../queries/useVerifyEmailQuery";
import { VerifyEmailLoading } from "./components/VerifyEmailLoading";
import { VerifyEmailSuccess } from "./components/VerifyEmailSuccess";
import { VerifyEmailError } from "./components/VerifyEmailError";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const { isLoading, isSuccess, isError, data, error } = useVerifyEmailQuery(token);

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => router.push("/auth/login"), 3000);
    }
  }, [isSuccess, router]);

  return (
    <div className="w-full max-w-96 sm:max-w-105 flex flex-col gap-5 text-center">
      {isLoading && <VerifyEmailLoading />}
      {isSuccess && <VerifyEmailSuccess message={data.message} />}
      {isError && (
        <VerifyEmailError
          message={error instanceof Error ? error.message : "Token inválido ou expirado."}
        />
      )}
    </div>
  );
}
