import Link from "next/link";

type EmptyStateProps = {
  message: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({ message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
      <p className="text-gray-600 mb-4">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="text-blue-600 hover:underline text-sm">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
