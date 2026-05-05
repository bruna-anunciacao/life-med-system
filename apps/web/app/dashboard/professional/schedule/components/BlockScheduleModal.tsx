"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useCreateScheduleBlockMutation, useScheduleBlocksQuery, useDeleteScheduleBlockMutation } from "@/queries/useProfessionalAppointments";
import { Trash2 } from "lucide-react";

interface BlockScheduleModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
}

export function BlockScheduleModal({ isOpen, onOpenChange, selectedDate }: BlockScheduleModalProps) {
  const [isFullDay, setIsFullDay] = useState(true);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const { data: blocks, isLoading: isLoadingBlocks } = useScheduleBlocksQuery();
  const { mutate: createBlock, isPending: isCreating } = useCreateScheduleBlockMutation();
  const { mutate: deleteBlock, isPending: isDeleting } = useDeleteScheduleBlockMutation();

  const handleCreateBlock = () => {
    if (!selectedDate) return;
    
    createBlock({
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: isFullDay ? undefined : startTime,
      endTime: isFullDay ? undefined : endTime,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setStartTime("");
        setEndTime("");
        setIsFullDay(true);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-label="Modal de bloqueio de agenda">
        <DialogHeader>
          <DialogTitle>Bloquear Agenda</DialogTitle>
          <DialogDescription>
            {selectedDate ? `Bloquear horários no dia ${format(selectedDate, "dd/MM/yyyy")}. Consultas existentes serão canceladas.` : "Selecione um dia para bloquear."}
          </DialogDescription>
        </DialogHeader>

        {selectedDate && (
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="fullDay"
                checked={isFullDay}
                onChange={(e) => setIsFullDay(e.target.checked)}
                className="w-4 h-4"
                title="Marque para bloquear o dia inteiro"
              />
              <Label htmlFor="fullDay">Bloquear o dia inteiro</Label>
            </div>

            {!isFullDay && (
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="startTime">Horário de Início</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    title="Defina o início do bloqueio"
                    aria-label="Horário de início do bloqueio"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="endTime">Horário de Término</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    title="Defina o término do bloqueio"
                    aria-label="Horário de término do bloqueio"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleCreateBlock}
              disabled={isCreating || (!isFullDay && (!startTime || !endTime))}
              className="w-full mt-2"
              title="Confirmar o bloqueio da agenda para o período selecionado"
            >
              {isCreating ? "Bloqueando..." : "Confirmar Bloqueio"}
            </Button>
          </div>
        )}

        <div className="mt-6 border-t pt-4">
          <h4 className="text-sm font-semibold mb-3">Bloqueios Ativos</h4>
          {isLoadingBlocks ? (
            <p className="text-sm text-gray-500">Carregando bloqueios...</p>
          ) : blocks?.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum bloqueio ativo.</p>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-y-auto" aria-label="Lista de bloqueios de agenda ativos">
              {blocks?.map((block: any) => (
                <li key={block.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-md border">
                  <span>
                    <strong>{format(new Date(block.date + "T00:00:00"), "dd/MM/yyyy")}</strong>{" "}
                    {block.startTime ? `(${block.startTime} às ${block.endTime})` : "(Dia todo)"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBlock(block.id)}
                    disabled={isDeleting}
                    title="Remover este bloqueio de agenda"
                    aria-label={`Excluir bloqueio do dia ${format(new Date(block.date + "T00:00:00"), "dd/MM/yyyy")}`}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}