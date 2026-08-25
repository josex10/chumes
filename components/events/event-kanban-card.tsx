"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertTriangle,
  CalendarDays,
  Circle,
  FileText,
  GripVertical,
  Megaphone,
  Phone,
  UserRound,
} from "lucide-react";
import { EventStatusSelect } from "@/components/events/event-status-select";
import {
  extractPhoneDigits,
  formatPhoneNumber,
  resolveCustomerPhone,
} from "@/lib/customers/phone";
import { getEventBadges, getLinkedQuote } from "@/lib/events/event-badges";
import { PAYMENT_STATUS, PAYMENT_STATUS_LABELS } from "@/lib/payments/constants";
import { formatCurrency } from "@/lib/quotes/format";
import type { EventStatus, EventWithRelations } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type EventKanbanCardProps = {
  event: EventWithRelations;
  isDragOverlay?: boolean;
  showInvoiceStatus?: boolean;
  selectableStatuses?: EventStatus[];
  onStatusChange?: (eventId: string, nextStatusCode: string) => void;
  pending?: boolean;
};

const badgeStyles = {
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  muted: "bg-muted text-muted-foreground",
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

const badgeIcons = {
  "no-quote": FileText,
  "dates-pending": CalendarDays,
  "follow-up-due": AlertTriangle,
  "quote-status": FileText,
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
  selectableStatuses = [],
  onStatusChange,
  pending = false,
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
  const phone = resolveCustomerPhone(
    event.customer_contacts?.phone,
    event.customers.phone,
  );
  const phoneDigits = phone ? extractPhoneDigits(phone) : "";
  const formattedPhone = phone ? formatPhoneNumber(phone) : null;

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
          <p className="mt-1.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            <UserRound className="size-3.5 shrink-0" />
            <span className="truncate">{event.customers.name}</span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-sm">
            <Phone className="size-3.5 shrink-0 text-muted-foreground" />
            {formattedPhone && phoneDigits ? (
              <a
                href={`tel:${phoneDigits}`}
                className="truncate font-medium tabular-nums hover:underline"
                onClick={(clickEvent) => clickEvent.stopPropagation()}
                onPointerDown={(pointerEvent) => pointerEvent.stopPropagation()}
              >
                {formattedPhone}
              </a>
            ) : (
              <span className="truncate text-muted-foreground">Sin teléfono</span>
            )}
          </p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <Megaphone className="size-3.5 shrink-0" />
            <span className="truncate">{event.event_sources.name}</span>
          </p>
          {linkedQuote ? (
            <p className="mt-1 text-sm font-semibold">
              {formatCurrency(Number(linkedQuote.total))}
            </p>
          ) : null}
          {event.event_date ? (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5 shrink-0" />
              {new Date(`${event.event_date}T12:00:00`).toLocaleDateString("es-CR")}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted"
          {...attributes}
          {...listeners}
          aria-label="Mover evento"
        >
          <GripVertical className="size-4" />
        </button>
      </div>

      {selectableStatuses.length > 0 && onStatusChange && !isDragOverlay ? (
        <div
          className="mt-3"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <EventStatusSelect
            statuses={selectableStatuses}
            value={event.event_statuses.code}
            pending={pending}
            onValueChange={(nextStatusCode) =>
              onStatusChange(event.id, nextStatusCode)
            }
          />
        </div>
      ) : null}

      {badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {badges.map((badge) => {
            const Icon = badgeIcons[badge.key as keyof typeof badgeIcons];
            return (
              <span
                key={badge.key}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  badgeStyles[badge.variant],
                )}
              >
                {Icon ? <Icon className="size-3" /> : null}
                {badge.label}
              </span>
            );
          })}
        </div>
      )}

      {showInvoiceStatus ? <EventInvoiceStatus event={event} /> : null}
    </div>
  );
}
