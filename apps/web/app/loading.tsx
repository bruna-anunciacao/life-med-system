import { Spinner } from "@heroui/react";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background/50 backdrop-blur-sm z-50 fixed inset-0">
      <Spinner size="lg" />
    </div>
  );
}