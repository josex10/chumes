import { computeDatesStatus } from "@/lib/events/dates-status";
import { EVENT_PHASE } from "@/lib/events/constants";
import type { EventWithRelations } from "@/lib/supabase/types";

export type EventBadge = {
  key: string;
  label: string;
  variant: "warning" | "muted" | "info";
};

export function getLinkedQuote(event: EventWithRelations) {
  const quotes = event.quotes ?? [];
  return quotes[0] ?? null;
}

export function sumColumnQuoteTotals(events: EventWithRelations[]): number {
  return events.reduce((sum, event) => {
    const quote = getLinkedQuote(event);
    return sum + (quote ? Number(quote.total) : 0);
  }, 0);
}

export function getEventBadges(event: EventWithRelations): EventBadge[] {
  const badges: EventBadge[] = [];
  const linkedQuote = getLinkedQuote(event);

  if (!linkedQuote) {
    badges.push({
      key: "no-quote",
      label: "Sin cotización",
      variant: "warning",
    });
  }

  const datesStatus = computeDatesStatus(
    event.event_date,
    event.delivery_date,
    event.pickup_date,
  );

  if (datesStatus !== "COMPLETE") {
    badges.push({
      key: "dates-pending",
      label: "Fechas pendientes",
      variant: "warning",
    });
  }

  if (event.follow_up_at) {
    const followUp = new Date(event.follow_up_at);
    if (followUp <= new Date()) {
      badges.push({
        key: "follow-up-due",
        label: "Seguimiento vencido",
        variant: "info",
      });
    }
  }

  if (
    linkedQuote?.quote_statuses?.name &&
    event.event_statuses.phase !== EVENT_PHASE.OPERATIONAL
  ) {
    badges.push({
      key: "quote-status",
      label: linkedQuote.quote_statuses.name,
      variant: "muted",
    });
  }

  return badges;
}

export function canConfirmAndReserve(event: EventWithRelations): {
  ready: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  const linkedQuote = getLinkedQuote(event);

  if (!linkedQuote) {
    missing.push("cotización vinculada");
  } else if (!linkedQuote.quote_items?.length) {
    missing.push("productos en la cotización");
  }

  const datesStatus = computeDatesStatus(
    event.event_date,
    event.delivery_date,
    event.pickup_date,
  );

  if (datesStatus !== "COMPLETE") {
    missing.push("fechas completas");
  }

  return { ready: missing.length === 0, missing };
}
