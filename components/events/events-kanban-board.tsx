"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
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
import {
  EVENT_PHASE,
  EVENT_STATUS,
  EVENTS_PIPELINE_TAB,
  type EventsPipelineTab,
} from "@/lib/events/constants";
import { canTransitionStatus, withLostArchiveAtEnd } from "@/lib/events/status-transitions";
import { EventKanbanCard } from "@/components/events/event-kanban-card";
import { EventKanbanColumn } from "@/components/events/event-kanban-column";
import type { EventStatus, EventWithRelations } from "@/lib/supabase/types";

type EventsKanbanBoardProps = {
  statuses: EventStatus[];
  events: EventWithRelations[];
  pipelineTab: EventsPipelineTab;
};

export function EventsKanbanBoard({
  statuses,
  events,
  pipelineTab,
}: EventsKanbanBoardProps) {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventWithRelations | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const isCommercial = pipelineTab === EVENTS_PIPELINE_TAB.COMMERCIAL;
  const activeStatuses = isCommercial ? commercialStatuses : operationalStatuses;
  const selectableStatuses = useMemo(
    () =>
      withLostArchiveAtEnd(
        activeStatuses,
        statuses,
        isCommercial ? [] : [EVENT_STATUS.WON_ARCHIVED],
      ),
    [activeStatuses, isCommercial, statuses],
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    function onWheel(event: WheelEvent) {
      if (!scroller) return;

      const path = event.composedPath();
      const overPopover = path.some(
        (node) =>
          node instanceof HTMLElement &&
          (node.dataset.slot === "popover-content" ||
            node.dataset.slot === "select-content" ||
            node.dataset.slot === "dialog-content" ||
            node.dataset.slot === "dialog-overlay"),
      );
      if (overPopover) return;

      const overColumnBody = path.some(
        (node) =>
          node instanceof HTMLElement && node.dataset.columnScroll === "true",
      );

      const horizontalFromGesture =
        Math.abs(event.deltaX) > Math.abs(event.deltaY);
      const panBoard =
        event.shiftKey || horizontalFromGesture || !overColumnBody;

      if (!panBoard) return;

      const delta = event.shiftKey
        ? event.deltaY
        : horizontalFromGesture
          ? event.deltaX
          : event.deltaY;

      if (delta === 0) return;

      event.preventDefault();
      scroller.scrollLeft += delta;
    }

    scroller.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => scroller.removeEventListener("wheel", onWheel, true);
  }, []);

  function moveEvent(
    eventId: string,
    nextStatusCode: string,
    options?: { lostReason?: string },
  ) {
    const draggedEvent = events.find((item) => item.id === eventId);
    if (!draggedEvent) return;

    const currentStatusCode = draggedEvent.event_statuses.code;
    if (currentStatusCode === nextStatusCode) return;

    if (!canTransitionStatus(currentStatusCode, nextStatusCode)) {
      setError("No se puede mover a ese estado.");
      return;
    }

    setError(null);
    setPendingEventId(eventId);
    startTransition(async () => {
      const result = await updateEventStatus(eventId, nextStatusCode, options);
      setPendingEventId(null);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

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

    moveEvent(eventId, String(overId));
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <section className="flex min-h-0 flex-1 flex-col">
          {error ? (
            <p className="mb-2 shrink-0 text-sm text-destructive">{error}</p>
          ) : null}
          {isPending ? (
            <p className="mb-2 shrink-0 text-sm text-muted-foreground">
              Actualizando estado...
            </p>
          ) : null}
          <div
            ref={scrollerRef}
            className="flex min-h-0 flex-1 items-stretch gap-4 overflow-x-auto overflow-y-hidden pb-2"
          >
            {activeStatuses.map((status) => (
              <EventKanbanColumn
                key={status.code}
                status={status}
                events={eventsByStatus.get(status.code) ?? []}
                selectableStatuses={selectableStatuses}
                onStatusChange={moveEvent}
                pendingEventId={pendingEventId}
              />
            ))}
          </div>
        </section>

        <DragOverlay>
          {activeEvent ? (
            <EventKanbanCard
              event={activeEvent}
              isDragOverlay
              showInvoiceStatus={
                activeEvent.event_statuses.phase === "OPERATIONAL"
              }
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
