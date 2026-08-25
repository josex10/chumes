"use client";

import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ArchiveLostDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending?: boolean;
};

export function ArchiveLostDialog({
  open,
  onOpenChange,
  onConfirm,
  pending = false,
}: ArchiveLostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Archivar como perdido</DialogTitle>
          <DialogDescription>
            ¿Realmente quieres mover este evento a Cerrado Perdido - Archivo?
            El evento saldrá del tablero y pasará al historial.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="inline-flex items-center gap-1.5 bg-rose-600 text-white hover:bg-rose-700 hover:text-white dark:bg-rose-700 dark:hover:bg-rose-600"
            onClick={onConfirm}
            disabled={pending}
          >
            <Archive className="size-4" />
            Sí, archivar como perdido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
