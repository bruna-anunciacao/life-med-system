import Link from "next/link";

type PageHeaderAction = {
  label: string;
  href: string;
  colorClass?: string;
};

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: PageHeaderAction;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className={`text-white px-4 py-2 rounded-md text-sm font-medium ${action.colorClass ?? "bg-blue-600 hover:bg-blue-700"}`}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
