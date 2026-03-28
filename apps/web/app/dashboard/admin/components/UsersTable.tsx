"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { EyeIcon, CheckIcon, BanIcon, EditIcon } from "../../../utils/icons";
import { User } from "../../../../services/auth-service";

const statusVariantMap: Record<string, string> = {
  VERIFIED: "bg-green-100 text-green-700",
  BLOCKED: "bg-red-100 text-red-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETE: "bg-gray-100 text-gray-700",
};

const statusTextMap: Record<string, string> = {
  VERIFIED: "Verificado",
  BLOCKED: "Bloqueado",
  PENDING: "Pendente",
  COMPLETED: "Completo",
};

type UsersTableProps = {
  users: User[];
  listType: "patient" | "professional";
  title: string;
  emptyMessage: string;
  onStatusChange: (userId: string, newStatus: "VERIFIED" | "BLOCKED", listType: "patient" | "professional") => void;
};

export function UsersTable({ users, listType, title, emptyMessage, onStatusChange }: UsersTableProps) {
  const router = useRouter();

  return (
    <div className="w-4/5 max-w-[800px] p-6 mb-8 rounded-2xl border border-gray-200 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <div className="mb-6 pb-4 flex justify-between items-center border-b border-gray-100">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-700">
          {title}{" "}
          <span className="px-2 py-0.5 text-xs rounded-full font-semibold text-black bg-gray-200">
            {users.length}
          </span>
        </h2>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr className="grid grid-cols-[2fr_1fr_1fr] text-gray-700">
              <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">USUÁRIOS</th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">STATUS</th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr className="grid grid-cols-[2fr_1fr_1fr] text-gray-700">
                <td colSpan={3} className="p-3 border-b border-gray-200">
                  <div className="py-6 text-center text-gray-500">{emptyMessage}</div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="grid grid-cols-[2fr_1fr_1fr] text-gray-700 hover:bg-gray-50">
                  <td className="p-3 border-b border-gray-200">
                    <div className="flex flex-col gap-2">
                      <p className="font-bold">{user.name}</p>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                  </td>

                  <td className="p-3 border-b border-gray-200 flex items-center justify-center">
                    <div className="w-full flex justify-center">
                      <Badge
                        className={`px-4 ${statusVariantMap[user.status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {statusTextMap[user.status] ?? user.status}
                      </Badge>
                    </div>
                  </td>

                  <td className="p-3 border-b border-gray-200 flex items-center justify-center">
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        className="p-1 flex items-center justify-center rounded-lg border-none text-xl bg-transparent text-black cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:scale-110 hover:text-gray-600"
                        onClick={() => router.push(`/dashboard/admin/users/${user.id}`)}
                      >
                        <EyeIcon />
                      </Button>

                      {user.status === "COMPLETED" && (
                        <Button
                          className="p-1 flex items-center justify-center rounded-lg border-none text-xl bg-transparent text-emerald-500 cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:scale-110 hover:text-emerald-600"
                          onClick={() => onStatusChange(user.id, "VERIFIED", listType)}
                        >
                          <CheckIcon />
                        </Button>
                      )}

                      {user.status === "VERIFIED" && (
                        <Button
                          className="p-1 flex items-center justify-center rounded-lg border-none text-xl bg-transparent text-red-500 cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:scale-110 hover:text-red-600"
                          onClick={() => onStatusChange(user.id, "BLOCKED", listType)}
                        >
                          <BanIcon />
                        </Button>
                      )}

                      {user.status === "BLOCKED" && (
                        <Button
                          className="p-1 flex items-center justify-center rounded-lg border-none text-xl bg-transparent text-amber-500 cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:scale-110 hover:text-amber-600"
                          onClick={() => onStatusChange(user.id, "VERIFIED", listType)}
                        >
                          <CheckIcon />
                        </Button>
                      )}

                      <Button
                        className="p-1 flex items-center justify-center rounded-lg border-none text-xl bg-transparent text-black cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:scale-110 hover:text-gray-600"
                        onClick={() => router.push(`/dashboard/admin/users/${user.id}?edit=1`)}
                      >
                        <EditIcon />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
