"use client";

import { useEffect, useId, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LOST_REASON,
  LOST_REASON_OPTIONS,
  resolveLostReason,
  type LostReasonCode,
} from "@/lib/events/constants";
import { cn } from "@/lib/utils";

export type ArchiveEventKind = "won" | "lost";

type ArchiveEventDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (lostReason?: string) => void;
  pending?: boolean;
  kind?: ArchiveEventKind;
  defaultReasonCode?: LostReasonCode;
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
  defaultReasonCode,
}: ArchiveEventDialogProps) {
  const copy = COPY[kind];
  const Icon = copy.icon;
  const radioName = useId();
  const customReasonId = `${radioName}-custom`;
  const [selectedCode, setSelectedCode] = useState("");
  const [customText, setCustomText] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedCode(defaultReasonCode ?? "");
    setCustomText("");
  }, [open, defaultReasonCode]);

  const lostReason =
    kind === "lost" ? resolveLostReason(selectedCode, customText) : null;
  const canConfirm = kind === "won" || Boolean(lostReason);

  function handleConfirm() {
    if (kind === "lost") {
      if (!lostReason) return;
      onConfirm(lostReason);
      return;
    }
    onConfirm();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        {kind === "lost" ? (
          <fieldset className="space-y-3 border-0 p-0" disabled={pending}>
            <legend className="px-0 text-sm font-medium">Motivo de pérdida</legend>
            <div className="flex flex-col gap-1">
              {LOST_REASON_OPTIONS.map((option) => {
                const optionId = `${radioName}-${option.code}`;
                const isSelected = selectedCode === option.code;

                return (
                  <label
                    key={option.code}
                    htmlFor={optionId}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                      isSelected
                        ? "border-ring bg-muted/70"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <input
                      id={optionId}
                      type="radio"
                      name={radioName}
                      value={option.code}
                      checked={isSelected}
                      onChange={() => setSelectedCode(option.code)}
                      className="size-4 accent-rose-600"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
            {selectedCode === LOST_REASON.OTHER ? (
              <div className="space-y-1.5">
                <Label htmlFor={customReasonId}>Especifica el motivo</Label>
                <Textarea
                  id={customReasonId}
                  value={customText}
                  onChange={(event) => setCustomText(event.target.value)}
                  placeholder="Escribe el motivo..."
                  disabled={pending}
                />
              </div>
            ) : null}
          </fieldset>
        ) : null}
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
            onClick={handleConfirm}
            disabled={pending || !canConfirm}
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
