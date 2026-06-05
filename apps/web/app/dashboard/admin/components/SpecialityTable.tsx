"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useCreateSpeciality } from "@/queries/useCreateSpeciality";
import { useUpdateSpeciality } from "@/queries/useUpdateSpeciality";
import { useDeleteSpeciality } from "@/queries/useDeleteSpeciality";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Stethoscope, Plus, Pencil, Trash2 } from "lucide-react";
import {
  DataTable,
  DataTableBody,
  DataTableCard,
  DataTableCell,
  DataTableEmpty,
  DataTableHead,
  DataTableHeadCell,
  DataTableHeader,
  DataTableMobileItem,
  DataTableMobileList,
  DataTableRow,
  SortableHeader,
} from "@/components/ui/data-table";

type SortDir = "asc" | "desc";

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

  const [sortField, setSortField] = useState<"name" | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sortedSpecialities = useMemo(() => {
    if (!sortField) return specialities;
    return [...specialities].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [specialities, sortField, sortDir]);

  function toggleSort(field: "name") {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

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
      <DataTableCard>
        <DataTableHeader
          title="Especialidades"
          count={specialities.length}
          actions={
            <Button
              size="sm"
              onClick={openCreate}
              className="gap-1.5"
              title="Adicionar nova especialidade médica"
            >
              <Plus className="h-3.5 w-3.5" />
              {isMobile ? "Nova" : "Nova Especialidade"}
            </Button>
          }
        />

        {specialities.length === 0 ? (
          <DataTableEmpty
            icon={<Stethoscope className="h-8 w-8" />}
            title="Nenhuma especialidade"
            description="Adicione a primeira especialidade médica."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={openCreate}
                className="gap-1.5"
                title="Adicionar especialidade"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar
              </Button>
            }
          />
        ) : isMobile ? (
          <div className="relative">
            {isDeleting && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <p className="text-sm font-medium text-muted-foreground">Excluindo...</p>
              </div>
            )}
            <DataTableMobileList>
              {sortedSpecialities.map((spec) => (
                <DataTableMobileItem key={spec.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Stethoscope className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{spec.name}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(spec)}
                        title={`Editar especialidade ${spec.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                        onClick={() => handleDelete(spec.id, spec.name)}
                        title={`Excluir especialidade ${spec.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </DataTableMobileItem>
              ))}
            </DataTableMobileList>
          </div>
        ) : (
          <div className="relative">
            {isDeleting && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <p className="text-sm font-medium text-muted-foreground">Excluindo...</p>
              </div>
            )}
            <DataTable>
              <DataTableHead>
                <SortableHeader
                  field="name"
                  currentField={sortField}
                  direction={sortDir}
                  onToggle={toggleSort}
                >
                  Nome da especialidade
                </SortableHeader>
                <DataTableHeadCell align="center">Ações</DataTableHeadCell>
              </DataTableHead>
              <DataTableBody>
                {sortedSpecialities.map((spec) => (
                  <DataTableRow key={spec.id}>
                    <DataTableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Stethoscope className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium text-foreground">{spec.name}</span>
                      </div>
                    </DataTableCell>
                    <DataTableCell align="center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(spec)}
                          title={`Editar especialidade ${spec.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(spec.id, spec.name)}
                          title={`Excluir especialidade ${spec.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          </div>
        )}
      </DataTableCard>

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
                title="Nome da especialidade médica"
              />
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={isSaving}
                  title="Cancelar operação"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || !newSpecialityName.trim()}
                  title="Salvar alterações"
                >
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
