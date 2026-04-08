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
  onConfirm: () => void;
  isLoading: boolean;
};

export function CancelConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: CancelConfirmDialogProps) {
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

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Voltar
          </Button>
          <Button
            onClick={onConfirm}
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
