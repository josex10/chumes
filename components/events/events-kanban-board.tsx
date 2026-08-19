"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { updateEventStatus } from "@/lib/events/actions";
import { EVENT_PHASE } from "@/lib/events/constants";
import { canTransitionStatus } from "@/lib/events/status-transitions";
import { EventKanbanCard } from "@/components/events/event-kanban-card";
import { EventKanbanColumn } from "@/components/events/event-kanban-column";
import { Button } from "@/components/ui/button";
import type { EventStatus, EventWithRelations } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type EventsKanbanBoardProps = {
  statuses: EventStatus[];
  events: EventWithRelations[];
};

type ActivePipeline = "commercial" | "operational";

export function EventsKanbanBoard({
  statuses,
  events,
}: EventsKanbanBoardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeEvent, setActiveEvent] = useState<EventWithRelations | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePipeline, setActivePipeline] = useState<ActivePipeline>("commercial");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const commercialStatuses = useMemo(
    () => statuses.filter((s) => s.phase === EVENT_PHASE.COMMERCIAL),
    [statuses],
  );

  const operationalStatuses = useMemo(
    () => statuses.filter((s) => s.phase === EVENT_PHASE.OPERATIONAL),
    [statuses],
  );

  const eventsByStatus = useMemo(() => {
    const map = new Map<string, EventWithRelations[]>();
    for (const status of statuses) {
      map.set(status.code, []);
    }
    for (const event of events) {
      const code = event.event_statuses.code;
      const list = map.get(code) ?? [];
      list.push(event);
      map.set(code, list);
    }
    return map;
  }, [events, statuses]);

  const activeStatuses =
    activePipeline === "commercial" ? commercialStatuses : operationalStatuses;

  function handleDragStart(event: DragStartEvent) {
    const dragged = events.find((item) => item.id === event.active.id);
    setActiveEvent(dragged ?? null);
    setError(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveEvent(null);

    const eventId = String(event.active.id);
    const overId = event.over?.id;
    if (!overId) return;

    const draggedEvent = events.find((item) => item.id === eventId);
    if (!draggedEvent) return;

    const nextStatusCode = String(overId);
    const currentStatusCode = draggedEvent.event_statuses.code;

    if (currentStatusCode === nextStatusCode) return;

    if (!canTransitionStatus(currentStatusCode, nextStatusCode)) {
      setError("No se puede mover a esa columna.");
      return;
    }

    startTransition(async () => {
      const result = await updateEventStatus(eventId, nextStatusCode);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border bg-muted/30 p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            activePipeline === "commercial" &&
              "bg-background shadow-sm hover:bg-background",
          )}
          onClick={() => setActivePipeline("commercial")}
        >
          Comercial
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            activePipeline === "operational" &&
              "bg-background shadow-sm hover:bg-background",
          )}
          onClick={() => setActivePipeline("operational")}
        >
          Operación
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {isPending && (
        <p className="text-sm text-muted-foreground">Actualizando estado...</p>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-medium">
              {activePipeline === "commercial" ? "Pipeline comercial" : "Operación"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activePipeline === "commercial"
                ? "Flexible — mueve deals libremente entre columnas."
                : "Estricto — solo avances válidos después de reservar."}
            </p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {activeStatuses.map((status) => (
              <EventKanbanColumn
                key={status.code}
                status={status}
                events={eventsByStatus.get(status.code) ?? []}
              />
            ))}
          </div>
        </section>

        <DragOverlay>
          {activeEvent ? (
            <EventKanbanCard event={activeEvent} isDragOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
