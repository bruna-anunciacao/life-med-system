"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditIcon, TrashIcon } from "../../../utils/icons"; // Lembre de garantir que tem o TrashIcon!

import { useCreateSpeciality } from "@/queries/useCreateSpeciality";
import { useUpdateSpeciality } from "@/queries/useUpdateSpeciality";
import { useDeleteSpeciality } from "@/queries/useDeleteSpeciality";

interface Speciality {
    id: string;
    name: string;
}

interface SpecialitiesTableProps {
    specialities: Speciality[];
}

export const SpecialitiesTable = ({ specialities }: SpecialitiesTableProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSpecialityName, setNewSpecialityName] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);

    const { mutate: createSpeciality, isPending: isCreating } = useCreateSpeciality();
    const { mutate: updateSpeciality, isPending: isUpdating } = useUpdateSpeciality();
    const { mutate: deleteSpeciality, isPending: isDeleting } = useDeleteSpeciality();

    const isSaving = isCreating || isUpdating;

    const handleOpenCreate = () => {
        setEditingId(null);
        setNewSpecialityName("");
        setIsModalOpen(true);
    };

    const handleOpenEdit = (spec: Speciality) => {
        setEditingId(spec.id);
        setNewSpecialityName(spec.name);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setNewSpecialityName("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSpecialityName.trim()) return;

        if (editingId) {
            updateSpeciality(
                { id: editingId, name: newSpecialityName },
                { onSuccess: closeModal }
            );
        } else {
            createSpeciality(newSpecialityName, { onSuccess: closeModal });
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja excluir a especialidade "${name}"?`)) {
            deleteSpeciality(id);
        }
    };

    return (
        <div className="w-4/5 max-w-[800px] p-6 mb-8 rounded-2xl border border-gray-200 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] relative">

            {/* Cabeçalho */}
            <div className="mb-6 pb-4 flex justify-between items-center border-b border-gray-100">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-700">
                    Especialidades Médicas{" "}
                    <span className="px-2 py-0.5 text-xs rounded-full font-semibold text-black bg-gray-200">
                        {specialities.length}
                    </span>
                </h2>
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    onClick={handleOpenCreate}
                >
                    + Nova Especialidade
                </Button>
            </div>

            {/* Tabela */}
            <div className="w-full overflow-x-auto relative">

                {isDeleting && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="text-sm font-semibold text-blue-600">Excluindo...</span>
                    </div>
                )}

                <table className="w-full border-collapse">
                    <thead className="bg-gray-50">
                        <tr className="grid grid-cols-[2fr_1fr_1fr] text-gray-700">
                            <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                                NOME DA ESPECIALIDADE
                            </th>
                            <th className="p-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
                                ID (SISTEMA)
                            </th>
                            <th className="p-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
                                AÇÕES
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {specialities.length === 0 ? (
                            <tr className="grid grid-cols-[2fr_1fr_1fr] text-gray-700">
                                <td colSpan={3} className="p-3 border-b border-gray-200">
                                    <div className="py-6 text-center text-gray-500">Nenhuma especialidade cadastrada.</div>
                                </td>
                            </tr>
                        ) : (
                            specialities.map((spec) => (
                                <tr key={spec.id} className="grid grid-cols-[2fr_1fr_1fr] text-gray-700 hover:bg-gray-50">
                                    <td className="p-3 border-b border-gray-200 flex items-center">
                                        <p className="font-bold">{spec.name}</p>
                                    </td>
                                    <td className="p-3 border-b border-gray-200 flex items-center justify-center">
                                        <p className="text-gray-400 text-sm font-mono truncate max-w-[120px]" title={spec.id}>
                                            {spec.id.split('-')[0]}...
                                        </p>
                                    </td>
                                    <td className="p-3 border-b border-gray-200 flex items-center justify-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                className="p-2 flex items-center justify-center rounded-lg border-none text-xl bg-transparent text-gray-500 cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:scale-110 hover:text-blue-600"
                                                onClick={() => handleOpenEdit(spec)}
                                                title="Editar Especialidade"
                                            >
                                                <EditIcon />
                                            </Button>
                                            <Button
                                                className="p-2 flex items-center justify-center rounded-lg border-none text-xl bg-transparent text-gray-500 cursor-pointer transition-all duration-200 hover:bg-red-50 hover:scale-110 hover:text-red-600"
                                                onClick={() => handleDelete(spec.id, spec.name)}
                                                title="Excluir Especialidade"
                                            >
                                                <TrashIcon />
                                            </Button>

                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL CRIAR E EDITAR */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {editingId ? "Editar Especialidade" : "Nova Especialidade"}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {editingId
                                ? "Altere o nome da área médica selecionada."
                                : "Digite o nome da área médica para adicionar ao sistema."}
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Ex: Cardiologia"
                                    value={newSpecialityName}
                                    onChange={(e) => setNewSpecialityName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModal}
                                    disabled={isSaving}
                                    className="px-5 py-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSaving || !newSpecialityName.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 shadow-sm disabled:opacity-50"
                                >
                                    {isSaving ? "Salvando..." : "Salvar"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};