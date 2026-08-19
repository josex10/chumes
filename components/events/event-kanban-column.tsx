"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { sumColumnQuoteTotals } from "@/lib/events/event-badges";
import { formatCurrency } from "@/lib/quotes/format";
import { EventKanbanCard } from "@/components/events/event-kanban-card";
import type { EventStatus, EventWithRelations } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type EventKanbanColumnProps = {
  status: EventStatus;
  events: EventWithRelations[];
};

export function EventKanbanColumn({ status, events }: EventKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.code,
    data: { status },
  });

  const columnTotal = sumColumnQuoteTotals(events);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/20",
        isOver && "ring-2 ring-ring/30",
      )}
    >
      <div className="border-b px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium">{status.name}</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {events.length}
          </span>
        </div>
      </div>

      <SortableContext
        items={events.map((event) => event.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-32 flex-1 flex-col gap-2 overflow-y-auto p-3">
          {events.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Sin eventos
            </p>
          ) : (
            events.map((event) => (
              <EventKanbanCard
                key={event.id}
                event={event}
                showInvoiceStatus={status.phase === "OPERATIONAL"}
              />
            ))
          )}
        </div>
      </SortableContext>

      <div className="border-t px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-sm font-semibold">{formatCurrency(columnTotal)}</span>
        </div>
      </div>
    </div>
  );
}
