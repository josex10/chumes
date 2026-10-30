"use client";

import { type ReactNode, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  toggleHoursConfirmed,
  updateDeliveryTime,
} from "@/lib/logistics/actions";
import { formatDeliveryPickupDateTime, toDatetimeLocalValue } from "@/lib/events/format-dates";
import type { EventLogistics } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type HoursConfirmedCheckProps = {
  eventId: string;
  deliveryDate: string | null;
  logistics: EventLogistics | null;
  leading?: ReactNode;
  trailing?: ReactNode;
  aside?: ReactNode;
};

type PendingKind = "toggle" | "time";

export function HoursConfirmedCheck({
  eventId,
  deliveryDate,
  logistics,
  leading,
  trailing,
  aside,
}: HoursConfirmedCheckProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingKind, setPendingKind] = useState<PendingKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const savedLocal = toDatetimeLocalValue(deliveryDate);
  const [dateTimeDraft, setDateTimeDraft] = useState<{
    source: string;
    value: string;
  } | null>(null);
  const dateTimeValue =
    dateTimeDraft?.source === savedLocal ? dateTimeDraft.value : savedLocal;
  const done = Boolean(logistics?.hours_confirmed_at);
  const scheduleLabel = formatDeliveryPickupDateTime(deliveryDate);
  const draftLocal = dateTimeValue.slice(0, 16);
  const scheduleChanged =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(draftLocal) &&
    draftLocal !== savedLocal;

  function handleToggle() {
    setError(null);
    setPendingKind("toggle");
    startTransition(async () => {
      const result = await toggleHoursConfirmed(eventId);
      setPendingKind(null);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleSaveSchedule() {
    if (!scheduleChanged) return;
    setError(null);
    setPendingKind("time");
    startTransition(async () => {
      const result = await updateDeliveryTime(eventId, draftLocal);
      setPendingKind(null);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">{leading}</div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            aria-pressed={done}
            disabled={isPending}
            onClick={handleToggle}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium shadow-sm transition-colors disabled:opacity-60",
              done
                ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600/90"
                : "border-border bg-background hover:bg-muted",
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border",
                done
                  ? "border-white/50 bg-white/15"
                  : "border-input bg-background",
              )}
            >
              {pendingKind === "toggle" && isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : done ? (
                <Check className="size-3.5" />
              ) : null}
            </span>
            Horas confirmadas
          </button>
          {trailing}
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-1">
              <Label htmlFor={`delivery-datetime-${eventId}`} className="text-xs">
                Fecha y hora de entrega
              </Label>
              <Input
                id={`delivery-datetime-${eventId}`}
                type="datetime-local"
                value={dateTimeValue}
                disabled={isPending}
                onChange={(event) =>
                  setDateTimeDraft({
                    source: savedLocal,
                    value: event.target.value.slice(0, 16),
                  })
                }
              />
            </div>
            {scheduleChanged ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="min-h-8"
                disabled={isPending}
                onClick={handleSaveSchedule}
              >
                {pendingKind === "time" && isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : null}
                Guardar fecha
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            {scheduleLabel ?? "Sin fecha de entrega registrada"}
          </p>
          {scheduleChanged && done ? (
            <p className="text-xs text-muted-foreground">
              Al guardar esta fecha hay que confirmarla de nuevo con el cliente.
            </p>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        {aside}
      </div>
    </div>
  );
}
