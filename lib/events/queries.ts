import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { EVENT_STATUS } from "@/lib/events/constants";
import type { EventReservationPdfData } from "@/lib/events/pdf/types";
import { getQuoteById } from "@/lib/quotes/queries";
import type {
  EventStatus,
  EventWithRelations,
} from "@/lib/supabase/types";

const EVENT_SELECT = `
  *,
  customers(*, customer_types(*)),
  customer_contacts(*),
  event_statuses(*),
  event_sources(*)
`;

async function attachQuotesToEvents(
  events: EventWithRelations[],
): Promise<EventWithRelations[]> {
  if (events.length === 0) return events;

  const supabase = createAdminSupabaseClient();
  const eventIds = events.map((event) => event.id);
  const { data: quotes, error } = await supabase
    .from("quotes")
    .select("*, quote_statuses(*), quote_items(id)")
    .in("event_id", eventIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[attachQuotesToEvents]", error.message);
    return events;
  }

  const quotesByEvent = new Map<string, NonNullable<EventWithRelations["quotes"]>>();
  for (const quote of quotes ?? []) {
    if (!quote.event_id) continue;
    if (!quotesByEvent.has(quote.event_id)) {
      quotesByEvent.set(quote.event_id, [quote]);
    }
  }

  return events.map((event) => ({
    ...event,
    quotes: quotesByEvent.get(event.id) ?? [],
  }));
}

export async function getEventStatuses(): Promise<EventStatus[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_statuses")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    console.error("[getEventStatuses]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getEvents(): Promise<EventWithRelations[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[getEvents]", error.message);
    return [];
  }

  return attachQuotesToEvents((data ?? []) as EventWithRelations[]);
}

export async function getEventsByPhase(
  phase: "COMMERCIAL" | "OPERATIONAL" | "TERMINAL",
): Promise<EventWithRelations[]> {
  const supabase = createAdminSupabaseClient();
  const { data: statuses } = await supabase
    .from("event_statuses")
    .select("id")
    .eq("phase", phase)
    .eq("is_active", true);

  if (!statuses?.length) return [];

  const statusIds = statuses.map((s) => s.id);
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .in("status_id", statusIds)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[getEventsByPhase]", error.message);
    return [];
  }

  return attachQuotesToEvents((data ?? []) as EventWithRelations[]);
}

export async function getEventById(id: string): Promise<EventWithRelations | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getEventById]", error.message);
    return null;
  }

  if (!data) return null;

  const [event] = await attachQuotesToEvents([data as EventWithRelations]);
  const { data: linkedQuote } = await supabase
    .from("quotes")
    .select("*, quote_statuses(*), quote_items(*, products(*))")
    .eq("event_id", id)
    .maybeSingle();

  return {
    ...event,
    quotes: linkedQuote ? [linkedQuote] : [],
  };
}

export async function getLinkableEventsForCustomer(
  customerId: string,
): Promise<EventWithRelations[]> {
  const supabase = createAdminSupabaseClient();

  const { data: commercialStatuses } = await supabase
    .from("event_statuses")
    .select("id")
    .eq("phase", "COMMERCIAL")
    .eq("is_active", true);

  if (!commercialStatuses?.length) return [];

  const statusIds = commercialStatuses.map((s) => s.id);
  const { data: events, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("customer_id", customerId)
    .in("status_id", statusIds)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[getLinkableEventsForCustomer]", error.message);
    return [];
  }

  const eventsWithQuotes = await attachQuotesToEvents(
    (events ?? []) as EventWithRelations[],
  );

  return eventsWithQuotes.filter((event) => !(event.quotes?.length ?? 0));
}

export async function getInquiryStatusId(): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_statuses")
    .select("id")
    .eq("code", EVENT_STATUS.INQUIRY)
    .single();

  if (error || !data) {
    throw new Error("Could not load inquiry status.");
  }

  return data.id;
}

export async function getEventLinkedQuote(eventId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*, quote_statuses(*), quote_items(id)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[getEventLinkedQuote]", error.message);
    return null;
  }

  return data;
}

export async function getEventReservationPdfData(
  eventId: string,
): Promise<EventReservationPdfData | null> {
  const event = await getEventById(eventId);
  if (!event) return null;

  const linkedQuote = await getEventLinkedQuote(eventId);
  if (!linkedQuote) return null;

  const quote = await getQuoteById(linkedQuote.id);
  if (!quote?.quote_items?.length) return null;

  return { event, quote };
}
