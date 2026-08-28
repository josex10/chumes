"use client";

import { Archive, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ArchiveEventKind = "won" | "lost";

type ArchiveEventDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending?: boolean;
  kind?: ArchiveEventKind;
};

const COPY: Record<
  ArchiveEventKind,
  {
    title: string;
    description: string;
    confirmLabel: string;
    confirmClassName: string;
    icon: typeof Archive;
  }
> = {
  lost: {
    title: "Archivar como perdido",
    description:
      "¿Realmente quieres mover este evento a Cerrado Perdido - Archivo? El evento saldrá del tablero y pasará al historial.",
    confirmLabel: "Sí, archivar como perdido",
    confirmClassName:
      "inline-flex items-center gap-1.5 bg-rose-600 text-white hover:bg-rose-700 hover:text-white dark:bg-rose-700 dark:hover:bg-rose-600",
    icon: Archive,
  },
  won: {
    title: "Archivar como ganado",
    description:
      "¿Realmente quieres mover este evento a Cerrado Ganado - Archivo? El evento saldrá del tablero y pasará al historial.",
    confirmLabel: "Sí, archivar como ganado",
    confirmClassName:
      "inline-flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white dark:bg-emerald-700 dark:hover:bg-emerald-600",
    icon: Trophy,
  },
};

export function ArchiveEventDialog({
  open,
  onOpenChange,
  onConfirm,
  pending = false,
  kind = "lost",
}: ArchiveEventDialogProps) {
  const copy = COPY[kind];
  const Icon = copy.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
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
            variant={kind === "lost" ? "destructive" : "default"}
            className={copy.confirmClassName}
            onClick={onConfirm}
            disabled={pending}
          >
            <Icon className="size-4" />
            {copy.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ArchiveLostDialog(props: Omit<ArchiveEventDialogProps, "kind">) {
  return <ArchiveEventDialog kind="lost" {...props} />;
}
