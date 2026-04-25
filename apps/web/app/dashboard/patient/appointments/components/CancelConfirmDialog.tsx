import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type CancelConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
  isLoading: boolean;
};

export function CancelConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: CancelConfirmDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  const handleConfirm = () => {
    const formattedReason = reason.trim()
      ? `[Paciente] ${reason.trim()}`
      : "[Paciente]";

    onConfirm(formattedReason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancelar Consulta</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar esta consulta? O cancelamento deve
            ser feito com pelo menos 24 horas de antecedência.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <label htmlFor="reason" className="text-sm font-medium text-gray-700">
            Motivo do cancelamento (Opcional)
          </label>
          <textarea
            id="reason"
            placeholder="Por que você está cancelando a consulta?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full min-h-25 p-3 resize-none rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[14.5px] leading-relaxed placeholder:text-slate-400 shadow-sm transition-all duration-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/20"
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Voltar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" /> Cancelando...
              </span>
            ) : (
              "Cancelar Consulta"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
