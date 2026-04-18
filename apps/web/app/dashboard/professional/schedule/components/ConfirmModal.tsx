import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STATUS_TEXT: Record<string, string> = {
  CONFIRMED: "Confirmado",
  COMPLETED: "Realizado",
  CANCELLED: "Cancelado",
  NO_SHOW: "Faltou",
  PENDING: "Pendente",
};

const STATUS_BADGE_COLOR: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-800 border-green-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  NO_SHOW: "bg-red-100 text-red-800 border-red-200",
  PENDING: "bg-[#fef0c7] text-[#b54708] border-[#fdb022]",
};

interface ConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pendingStatus: string;
  onConfirm: (notes?: string) => void;
}

export function ConfirmModal({
  isOpen,
  onOpenChange,
  pendingStatus,
  onConfirm,
}: ConfirmModalProps) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNotes("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(notes);
  };

  if (!pendingStatus) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 bg-white p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="p-6 pb-4">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-xl font-semibold text-slate-900 tracking-tight">
              Confirmar alteração de status
            </DialogTitle>
            <DialogDescription className="text-[14.5px] text-slate-500 leading-relaxed pt-2">
              Você está alterando o status desta consulta para{" "}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[13px] font-semibold border ${
                  STATUS_BADGE_COLOR[pendingStatus] ||
                  "bg-slate-100 text-slate-800 border-slate-200"
                }`}
              >
                {STATUS_TEXT[pendingStatus]}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2.5">
            <label
              htmlFor="notes"
              className="text-sm font-medium text-slate-700"
            >
              Observação{" "}
              <span className="text-slate-400 font-normal">(Opcional)</span>
            </label>
            <textarea
              id="notes"
              placeholder="Adicione um motivo ou anotação..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-30 p-4 resize-none rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[14.5px] leading-relaxed placeholder:text-slate-400 shadow-sm transition-all duration-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/20"
            />
          </div>
        </div>
        <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl h-10 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors px-5 font-medium"
          >
            Voltar
          </Button>
          <Button
            onClick={handleConfirm}
            className="rounded-xl h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all px-6 font-medium"
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
