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
    <div className="w-full px-4 py-8 flex items-start justify-center bg-[#f8fafc]">
      <div className="w-full max-w-120 p-10 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-[#e2e8f0] bg-white text-center">
        {isLoading && <VerifyEmailLoading />}
        {isSuccess && <VerifyEmailSuccess message={data.message} />}
        {isError && (
          <VerifyEmailError
            message={error instanceof Error ? error.message : "Token inválido ou expirado."}
          />
        )}
      </div>
    </div>
  );
}
