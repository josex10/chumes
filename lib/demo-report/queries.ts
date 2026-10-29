import { buildDemoReport, type DemoEventRow, type DemoQuoteRow, type DemoReport } from "@/lib/demo-report/aggregate";
import {
  endOfCostaRicaDay,
  startOfCostaRicaDay,
  type DemoPeriod,
} from "@/lib/demo-report/period";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type StatusEmbed = { code: string; name: string } | { code: string; name: string }[] | null;
type CustomerEmbed = { name: string } | { name: string }[] | null;
type QuoteStatusEmbed = { name: string } | { name: string }[] | null;
type EventEmbed =
  | { title: string; event_date: string | null }
  | { title: string; event_date: string | null }[]
  | null;

type EventRecord = {
  id: string;
  title: string;
  event_date: string | null;
  created_at: string;
  archived_at: string | null;
  lost_reason: string | null;
  customers: CustomerEmbed;
  event_statuses: StatusEmbed;
};

type QuoteLink = {
  id: string;
  event_id: string | null;
  total: number | null;
  delivery_fee: number | null;
  created_at: string;
};

type QuoteRecord = {
  id: string;
  quote_number: string;
  event_id: string | null;
  total: number | null;
  created_at: string;
  customers: CustomerEmbed;
  quote_statuses: QuoteStatusEmbed;
  events: EventEmbed;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function mapEvent(event: EventRecord, quote: QuoteLink | null): DemoEventRow {
  const customer = one(event.customers);
  const status = one(event.event_statuses);
  return {
    id: event.id,
    title: event.title,
    customerName: customer?.name ?? "—",
    eventDate: event.event_date,
    createdAt: event.created_at,
    archivedAt: event.archived_at,
    lostReason: event.lost_reason,
    statusCode: status?.code ?? "",
    statusName: status?.name ?? "—",
    quoteId: quote?.id ?? null,
    quoteTotal: quote ? Number(quote.total ?? 0) : 0,
    deliveryFee: quote ? Number(quote.delivery_fee ?? 0) : 0,
  };
}

async function attachLatestQuotes(events: EventRecord[]): Promise<DemoEventRow[]> {
  if (events.length === 0) return [];

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("id, event_id, total, delivery_fee, created_at")
    .in(
      "event_id",
      events.map((event) => event.id),
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[demo-report] quotes por evento", error.message);
  }

  const latest = new Map<string, QuoteLink>();
  for (const quote of (data ?? []) as QuoteLink[]) {
    if (!quote.event_id || latest.has(quote.event_id)) continue;
    latest.set(quote.event_id, quote);
  }

  return events.map((event) => mapEvent(event, latest.get(event.id) ?? null));
}

async function getEventsByEventDate(
  startKey: string,
  endKey: string,
): Promise<DemoEventRow[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, event_date, created_at, archived_at, lost_reason, customers(name), event_statuses(code, name)",
    )
    .gte("event_date", startKey)
    .lte("event_date", endKey)
    .order("event_date", { ascending: true });

  if (error) {
    console.error("[demo-report] eventos por fecha", error.message);
    return [];
  }

  return attachLatestQuotes((data ?? []) as EventRecord[]);
}

async function getLeadsCreatedBetween(start: Date, end: Date): Promise<DemoEventRow[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, event_date, created_at, archived_at, lost_reason, customers(name), event_statuses(code, name)",
    )
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[demo-report] leads", error.message);
    return [];
  }

  return ((data ?? []) as EventRecord[]).map((event) => mapEvent(event, null));
}

async function getQuotesCreatedBetween(start: Date, end: Date): Promise<DemoQuoteRow[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, quote_number, event_id, total, created_at, customers(name), quote_statuses(name), events(title, event_date)",
    )
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[demo-report] cotizaciones", error.message);
    return [];
  }

  return ((data ?? []) as QuoteRecord[]).map((quote) => {
    const customer = one(quote.customers);
    const status = one(quote.quote_statuses);
    const event = one(quote.events);
    return {
      id: quote.id,
      quoteNumber: quote.quote_number,
      customerName: customer?.name ?? "—",
      eventId: quote.event_id,
      eventTitle: event?.title ?? null,
      eventDate: event?.event_date ?? null,
      createdAt: quote.created_at,
      statusName: status?.name ?? "—",
      total: Number(quote.total ?? 0),
    };
  });
}

export async function getDemoReport(period: DemoPeriod): Promise<DemoReport> {
  const start = startOfCostaRicaDay(period.startKey);
  const end = endOfCostaRicaDay(period.endKey);

  const [eventsByDate, leads, quotes] = await Promise.all([
    getEventsByEventDate(period.startKey, period.endKey),
    getLeadsCreatedBetween(start, end),
    getQuotesCreatedBetween(start, end),
  ]);

  return buildDemoReport(period, eventsByDate, leads, quotes);
}
