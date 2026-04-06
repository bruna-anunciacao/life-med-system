import { Spinner } from "@/components/ui/spinner";

type LoadingPageProps = {
  message?: string;
};

export function LoadingPage({ message }: LoadingPageProps) {
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-3">
      <Spinner size="lg" />
      {message && <p className="text-gray-500 text-sm">{message}</p>}
    </div>
  );
}
