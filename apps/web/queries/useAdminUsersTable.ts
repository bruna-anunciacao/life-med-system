import { useMemo } from "react";
import Fuse from "fuse.js";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { adminService } from "../services/admin-service";

export type TypeFilter = "all" | "PATIENT" | "PROFESSIONAL" | "MANAGER";

const FUSE_OPTIONS = { keys: ["name", "email"], threshold: 0.3 };

export function useAdminUsersTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const typeFilter = (searchParams.get("role") as TypeFilter) ?? "all";
  const search = searchParams.get("search") ?? "";

  function setTypeFilter(value: TypeFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("role");
    } else {
      params.set("role", value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function setSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value.trim()) {
      params.delete("search");
    } else {
      params.set("search", value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const role = typeFilter !== "all" ? typeFilter : undefined;

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-users", { role }],
    queryFn: () => adminService.listUsers({ role }),
  });

  const users = useMemo(() => {
    if (!search.trim()) return data;
    return new Fuse(data, FUSE_OPTIONS).search(search).map((r) => r.item);
  }, [data, search]);

  return { users, isLoading, search, setSearch, typeFilter, setTypeFilter };
}
