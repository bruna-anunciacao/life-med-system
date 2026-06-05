import { Skeleton } from "@/components/ui/skeleton";
import {
  DataTable,
  DataTableBody,
  DataTableCard,
  DataTableCell,
  DataTableHead,
  DataTableHeadCell,
  DataTableMobileItem,
  DataTableMobileList,
  DataTableRow,
} from "@/components/ui/data-table";

export function StatsCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className={`grid grid-cols-2 ${count >= 4 ? "md:grid-cols-4" : "md:grid-cols-3"} gap-3 md:gap-4 mb-6`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-12" />
            </div>
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  columns = 5,
  isMobile = false,
}: {
  rows?: number;
  columns?: number;
  isMobile?: boolean;
}) {
  if (isMobile) {
    return (
      <DataTableCard>
        <DataTableMobileList>
          {Array.from({ length: rows }).map((_, i) => (
            <DataTableMobileItem key={i}>
              <div className="flex gap-3 mb-3">
                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </DataTableMobileItem>
          ))}
        </DataTableMobileList>
      </DataTableCard>
    );
  }

  return (
    <DataTableCard>
      <DataTable>
        <DataTableHead>
          {Array.from({ length: columns }).map((_, i) => (
            <DataTableHeadCell key={i}>
              <Skeleton className="h-3 w-20" />
            </DataTableHeadCell>
          ))}
        </DataTableHead>
        <DataTableBody>
          {Array.from({ length: rows }).map((_, r) => (
            <DataTableRow key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <DataTableCell key={c}>
                  {c === 0 ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <Skeleton className="h-4 w-24" />
                  )}
                </DataTableCell>
              ))}
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </DataTableCard>
  );
}

export function CardGridSkeleton({
  count = 6,
  minWidth = 300,
}: {
  count?: number;
  minWidth?: number;
}) {
  return (
    <div
      className="grid gap-4 sm:gap-5 grid-cols-1"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${minWidth}px), 1fr))`,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-9 w-full mt-4 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton({
  withAction = true,
}: {
  withAction?: boolean;
}) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {withAction && <Skeleton className="h-10 w-full sm:w-40 rounded-md" />}
    </div>
  );
}

export function DashboardHomeSkeleton() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="mb-6 grid gap-4 grid-cols-1 lg:grid-cols-[1fr_340px]">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-9 w-32 mt-2 rounded-md" />
        </div>
        <StatsCardsSkeleton count={3} />
      </div>
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
            <Skeleton className="h-5 w-40" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
            <Skeleton className="h-5 w-40" />
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto">
      <Skeleton className="h-9 w-24 mb-6 rounded-md" />
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm space-y-8">
        <div className="flex items-center gap-5">
          <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64 max-w-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function QuestionnaireSkeleton({ questions = 5 }: { questions?: number }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: questions }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="space-y-2 pl-9">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
