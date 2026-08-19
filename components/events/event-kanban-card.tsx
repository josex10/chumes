"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Circle } from "lucide-react";
import { getEventBadges, getLinkedQuote } from "@/lib/events/event-badges";
import { PAYMENT_STATUS, PAYMENT_STATUS_LABELS } from "@/lib/payments/constants";
import { formatCurrency } from "@/lib/quotes/format";
import type { EventWithRelations } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type EventKanbanCardProps = {
  event: EventWithRelations;
  isDragOverlay?: boolean;
  showInvoiceStatus?: boolean;
};

const badgeStyles = {
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  muted: "bg-muted text-muted-foreground",
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

function EventInvoiceStatus({ event }: { event: EventWithRelations }) {
  const linkedQuote = getLinkedQuote(event);
  if (!linkedQuote) return null;

  const summary =
    event.payment_summary ??
    ({
      balanceDue: Number(linkedQuote.total),
      paymentStatus: PAYMENT_STATUS.PENDING,
    } as const);

  const isPaid = summary.paymentStatus === PAYMENT_STATUS.PAID;
  const statusLabel = PAYMENT_STATUS_LABELS[summary.paymentStatus];

  return (
    <div className="mt-3 space-y-1 border-t border-border/60 pt-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Circle
            className={cn(
              "size-2 fill-current",
              isPaid ? "text-emerald-500" : "text-amber-500",
            )}
          />
          <span className="text-[11px] text-muted-foreground">Factura:</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              isPaid
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
            )}
          >
            {statusLabel}
          </span>
        </div>
      </div>
      {!isPaid && summary.balanceDue > 0 ? (
        <p className="text-[11px] text-muted-foreground/80">
          Por cancelar {formatCurrency(summary.balanceDue)}
        </p>
      ) : null}
    </div>
  );
}

export function EventKanbanCard({
  event,
  isDragOverlay,
  showInvoiceStatus = false,
}: EventKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id, data: { event } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const badges = getEventBadges(event);
  const linkedQuote = getLinkedQuote(event);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-background p-3 shadow-sm transition-shadow",
        isDragging && "opacity-50",
        isDragOverlay && "shadow-md ring-2 ring-ring/20",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/events/${event.id}`}
            className="block text-sm font-medium leading-snug break-words hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {event.title}
          </Link>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {event.customers.name}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {event.event_sources.name}
          </p>
          {linkedQuote && (
            <p className="mt-1 text-sm font-semibold">
              {formatCurrency(Number(linkedQuote.total))}
            </p>
          )}
          {event.event_date && (
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(event.event_date).toLocaleDateString()}
            </p>
          )}
        </div>
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted"
          {...attributes}
          {...listeners}
          aria-label="Mover evento"
        >
          ⋮⋮
        </button>
      </div>

      {badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <span
              key={badge.key}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                badgeStyles[badge.variant],
              )}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {showInvoiceStatus ? <EventInvoiceStatus event={event} /> : null}
    </div>
  );
}
