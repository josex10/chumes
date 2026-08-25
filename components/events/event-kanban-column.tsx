"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Inbox } from "lucide-react";
import { EventKanbanCard } from "@/components/events/event-kanban-card";
import { getEventStatusVisual } from "@/components/events/event-status-style";
import { sumColumnQuoteTotals } from "@/lib/events/event-badges";
import { formatCurrency } from "@/lib/quotes/format";
import type { EventStatus, EventWithRelations } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type EventKanbanColumnProps = {
  status: EventStatus;
  events: EventWithRelations[];
  selectableStatuses: EventStatus[];
  onStatusChange: (eventId: string, nextStatusCode: string) => void;
  pendingEventId?: string | null;
};

export function EventKanbanColumn({
  status,
  events,
  selectableStatuses,
  onStatusChange,
  pendingEventId,
}: EventKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.code,
    data: { status },
  });

  const columnTotal = sumColumnQuoteTotals(events);
  const visual = getEventStatusVisual(status.code);
  const StatusIcon = visual.icon;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full min-h-0 w-80 shrink-0 flex-col overflow-hidden rounded-xl border border-t-4 bg-muted/20",
        visual.columnAccent,
        isOver && "ring-2 ring-ring/30",
      )}
    >
      <div className="shrink-0 border-b px-3 py-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            <StatusIcon
              className={cn("mt-0.5 size-4 shrink-0", visual.iconClass)}
            />
            <h3 className="text-sm leading-snug font-medium">{status.name}</h3>
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {events.length}
          </span>
        </div>
      </div>

      <SortableContext
        items={events.map((event) => event.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          data-column-scroll="true"
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-y-contain p-3"
        >
          {events.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
              <Inbox className="size-5 text-muted-foreground/70" />
              <p className="text-xs text-muted-foreground">Sin eventos</p>
            </div>
          ) : (
            events.map((event) => (
              <EventKanbanCard
                key={event.id}
                event={event}
                showInvoiceStatus={status.phase === "OPERATIONAL"}
                selectableStatuses={selectableStatuses}
                onStatusChange={onStatusChange}
                pending={pendingEventId === event.id}
              />
            ))
          )}
        </div>
      </SortableContext>

      <div className="shrink-0 border-t bg-background/80 px-3 py-2 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-sm font-semibold">{formatCurrency(columnTotal)}</span>
        </div>
      </div>
    </div>
  );
}
