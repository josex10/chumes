"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import {
  ArchiveEventDialog,
  type ArchiveEventKind,
} from "@/components/events/archive-lost-dialog";
import { EVENT_STATUS, isArchivedStatus } from "@/lib/events/constants";
import { getEventStatusVisual } from "@/components/events/event-status-style";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { EventStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type EventStatusChangeOptions = {
  lostReason?: string;
};

type EventStatusSelectProps = {
  statuses: EventStatus[];
  value: string;
  onValueChange: (statusCode: string, options?: EventStatusChangeOptions) => void;
  disabled?: boolean;
  pending?: boolean;
  size?: "card" | "default";
};

export function EventStatusSelect({
  statuses,
  value,
  onValueChange,
  disabled = false,
  pending = false,
  size = "card",
}: EventStatusSelectProps) {
  const [open, setOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState<ArchiveEventKind | null>(
    null,
  );
  const selected =
    statuses.find((status) => status.code === value) ?? statuses[0];
  const selectedVisual = getEventStatusVisual(selected?.code ?? value);
  const SelectedIcon = selectedVisual.icon;
  const isInteractive = !disabled && statuses.length > 1;

  const triggerClassName = cn(
    "inline-flex w-full min-w-0 items-center gap-1.5 border font-medium transition outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
    size === "card"
      ? "h-7 rounded-full px-2.5 text-[11px]"
      : "h-8 rounded-full px-3 text-sm",
    selectedVisual.pill,
    isInteractive && "hover:brightness-[0.97] dark:hover:brightness-110",
    (disabled || pending) && "cursor-default opacity-70",
  );

  const triggerContent = (
    <>
      {pending ? (
        <Loader2 className="size-3.5 shrink-0 animate-spin" />
      ) : (
        <SelectedIcon className="size-3.5 shrink-0" />
      )}
      <span className="min-w-0 flex-1 truncate text-left">
        {selected?.name ?? value}
      </span>
      {isInteractive ? (
        <ChevronDown className="size-3.5 shrink-0 opacity-70" />
      ) : null}
    </>
  );

  if (!isInteractive) {
    return <span className={triggerClassName}>{triggerContent}</span>;
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled || pending}
          className="block w-full min-w-0"
          render={
            <button
              type="button"
              className={triggerClassName}
              aria-label="Cambiar estado del evento"
            />
          }
        >
          {triggerContent}
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={6} className="w-72 gap-0 p-1">
          <p className="px-2 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Mover a
          </p>
          <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
            {statuses.map((status, index) => {
              const visual = getEventStatusVisual(status.code);
              const Icon = visual.icon;
              const isSelected = status.code === value;
              const isLostArchive = status.code === EVENT_STATUS.LOST;
              const isWonArchive = status.code === EVENT_STATUS.WON_ARCHIVED;
              const prevCode = statuses[index - 1]?.code;
              const showDivider =
                isArchivedStatus(status.code) &&
                index > 0 &&
                !(prevCode && isArchivedStatus(prevCode));

              return (
                <div key={status.code}>
                  {showDivider ? (
                    <div className="my-1 border-t border-border/70" />
                  ) : null}
                  <button
                    type="button"
                    disabled={isSelected}
                    onClick={() => {
                      if (isSelected) return;
                      setOpen(false);
                      if (isLostArchive) {
                        setConfirmArchive("lost");
                        return;
                      }
                      if (isWonArchive) {
                        setConfirmArchive("won");
                        return;
                      }
                      onValueChange(status.code);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition",
                      isSelected ? "bg-muted/70" : "hover:bg-muted/50",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-7 shrink-0 items-center justify-center rounded-full border",
                        visual.pill,
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {status.name}
                    </span>
                    {isSelected ? (
                      <Check className="size-4 shrink-0 text-muted-foreground" />
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
      <ArchiveEventDialog
        kind={confirmArchive ?? "lost"}
        open={confirmArchive !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setConfirmArchive(null);
        }}
        pending={pending}
        onConfirm={(lostReason) => {
          const kind = confirmArchive;
          setConfirmArchive(null);
          if (kind === "won") {
            onValueChange(EVENT_STATUS.WON_ARCHIVED);
            return;
          }
          if (kind === "lost") {
            onValueChange(EVENT_STATUS.LOST, { lostReason });
          }
        }}
      />
    </>
  );
}
