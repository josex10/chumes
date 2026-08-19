"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmAndReserve, updateEventStatus } from "@/lib/events/actions";
import { EVENT_PHASE, EVENT_STATUS } from "@/lib/events/constants";
import { canConfirmAndReserve } from "@/lib/events/event-badges";
import { getStatusPhase } from "@/lib/events/status-transitions";
import { EventStatusCombobox } from "@/components/events/event-status-combobox";
import type { EventStatus, EventWithRelations } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type EventStatusActionsProps = {
  event: EventWithRelations;
  selectableStatuses: EventStatus[];
};

export function EventStatusActions({
  event,
  selectableStatuses,
}: EventStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const phase = getStatusPhase(event.event_statuses.code);
  const reserveCheck = canConfirmAndReserve(event);
  const isTerminal = phase === EVENT_PHASE.TERMINAL;
  const isLost = event.event_statuses.code === EVENT_STATUS.LOST;

  function handleStatusChange(nextStatusCode: string) {
    if (nextStatusCode === event.event_statuses.code) return;

    setError(null);
    startTransition(async () => {
      const result = await updateEventStatus(event.id, nextStatusCode);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleReserve() {
    setError(null);
    startTransition(async () => {
      const result = await confirmAndReserve(event.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTerminal ? (
          <div>
            <p className="text-sm text-muted-foreground">Estado actual</p>
            <p className="mt-1 font-medium">{event.event_statuses.name}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="event-status">Estado actual</Label>
            <EventStatusCombobox
              statuses={selectableStatuses}
              value={event.event_statuses.code}
              onValueChange={handleStatusChange}
              disabled={isPending}
            />
          </div>
        )}

        {isLost && event.lost_reason && (
          <div>
            <p className="text-sm text-muted-foreground">Motivo de pérdida</p>
            <p className="mt-1 text-sm">{event.lost_reason}</p>
          </div>
        )}

        {phase === EVENT_PHASE.COMMERCIAL && (
          <div className="rounded-lg border border-dashed p-3">
            <p className="text-sm font-medium">Confirmar y reservar</p>
            {!reserveCheck.ready ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Falta: {reserveCheck.missing.join(", ")}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Listo para pasar a operación.
              </p>
            )}
            <Button
              type="button"
              variant="commit"
              className="mt-3 w-full"
              disabled={isPending || !reserveCheck.ready}
              onClick={handleReserve}
            >
              Confirmar y reservar
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
