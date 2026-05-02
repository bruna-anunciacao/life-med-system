"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useCreateSpeciality } from "@/queries/useCreateSpeciality";
import { useUpdateSpeciality } from "@/queries/useUpdateSpeciality";
import { useDeleteSpeciality } from "@/queries/useDeleteSpeciality";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Stethoscope, Plus, Pencil, Trash2 } from "lucide-react";

interface Speciality {
  id: string;
  name: string;
}

interface SpecialitiesTableProps {
  specialities: Speciality[];
}

export const SpecialitiesTable = ({ specialities }: SpecialitiesTableProps) => {
  const isMobile = useIsMobile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSpecialityName, setNewSpecialityName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const { mutate: createSpeciality, isPending: isCreating } = useCreateSpeciality();
  const { mutate: updateSpeciality, isPending: isUpdating } = useUpdateSpeciality();
  const { mutate: deleteSpeciality, isPending: isDeleting } = useDeleteSpeciality();

  const isSaving = isCreating || isUpdating;

  function openCreate() {
    setEditingId(null);
    setNewSpecialityName("");
    setIsModalOpen(true);
  }

  function openEdit(spec: Speciality) {
    setEditingId(spec.id);
    setNewSpecialityName(spec.name);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setNewSpecialityName("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newSpecialityName.trim()) return;
    if (editingId) {
      updateSpeciality({ id: editingId, name: newSpecialityName }, { onSuccess: closeModal });
    } else {
      createSpeciality(newSpecialityName, { onSuccess: closeModal });
    }
  }

  function handleDelete(id: string, name: string) {
    if (window.confirm(`Excluir "${name}"?`)) deleteSpeciality(id);
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">Especialidades</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {specialities.length}
            </span>
          </div>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {isMobile ? "Nova" : "Nova Especialidade"}
          </Button>
        </div>

        {/* Empty state */}
        {specialities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <Stethoscope className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Nenhuma especialidade</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Adicione a primeira especialidade médica.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={openCreate} className="mt-1 gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>
        ) : isMobile ? (
          /* Mobile: cards */
          <div className="divide-y divide-border relative">
            {isDeleting && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <p className="text-sm font-medium text-muted-foreground">Excluindo...</p>
              </div>
            )}
            {specialities.map((spec) => (
              <div key={spec.id} className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{spec.name}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => openEdit(spec)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(spec.id, spec.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop: table */
          <div className="relative">
            {isDeleting && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <p className="text-sm font-medium text-muted-foreground">Excluindo...</p>
              </div>
            )}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 text-left">Nome da especialidade</th>
                  <th className="px-6 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {specialities.map((spec) => (
                  <tr key={spec.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Stethoscope className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium text-foreground">{spec.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(spec)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(spec.id, spec.name)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
          <div className="w-full rounded-t-2xl bg-card px-6 pb-8 pt-6 shadow-xl sm:max-w-md sm:rounded-2xl sm:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <h3 className="text-lg font-semibold text-foreground">
              {editingId ? "Editar especialidade" : "Nova especialidade"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {editingId
                ? "Altere o nome da área médica."
                : "Digite o nome da área médica para adicionar ao sistema."}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <Input
                autoFocus
                placeholder="Ex: Cardiologia"
                value={newSpecialityName}
                onChange={(e) => setNewSpecialityName(e.target.value)}
                disabled={isSaving}
              />
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={closeModal} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving || !newSpecialityName.trim()}>
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
