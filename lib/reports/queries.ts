import { EVENT_PHASE, EVENT_STATUS } from "@/lib/events/constants";
import { getEventsByPhase } from "@/lib/events/queries";
import { COSTA_RICA_OFFSET } from "@/lib/follow-ups/calendar";
import {
  LOST_DATE_FIELD,
  REPORTS_PAGE_SIZE,
  type LostDateFieldParam,
} from "@/lib/reports/constants";
import { buildPipelineReport, type PipelineReport } from "@/lib/reports/pipeline";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { EventWithRelations } from "@/lib/supabase/types";

const EVENT_SELECT = `
  *,
  customers(*, customer_types(*)),
  customer_contacts(*),
  event_statuses(*),
  event_sources(*)
`;

export type LostPipelineRow = {
  eventId: string;
  title: string;
  customerName: string;
  eventDate: string | null;
  archivedAt: string | null;
  lostReason: string | null;
  amount: number;
};

export type LostPipelineReport = {
  totalAmount: number;
  totalCount: number;
  page: number;
  pageSize: number;
  rows: LostPipelineRow[];
};

export type GetLostPipelineReportOptions = {
  dateFrom?: string;
  dateTo?: string;
  dateField?: LostDateFieldParam;
  page?: number;
  pageSize?: number;
};

export async function getPipelineReport(): Promise<PipelineReport> {
  const events = await getEventsByPhase(EVENT_PHASE.COMMERCIAL);
  return buildPipelineReport(events);
}

async function getLostStatusId(): Promise<number | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_statuses")
    .select("id")
    .eq("code", EVENT_STATUS.LOST)
    .maybeSingle();

  if (error) {
    console.error("[getLostStatusId]", error.message);
    return null;
  }

  return data?.id ?? null;
}

function startOfCostaRicaDay(dateKey: string): string {
  return `${dateKey}T00:00:00${COSTA_RICA_OFFSET}`;
}

function endOfCostaRicaDay(dateKey: string): string {
  return `${dateKey}T23:59:59.999${COSTA_RICA_OFFSET}`;
}

export async function getLostPipelineReport(
  options: GetLostPipelineReportOptions = {},
): Promise<LostPipelineReport> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.max(1, options.pageSize ?? REPORTS_PAGE_SIZE);
  const empty: LostPipelineReport = {
    totalAmount: 0,
    totalCount: 0,
    page,
    pageSize,
    rows: [],
  };

  const lostStatusId = await getLostStatusId();
  if (!lostStatusId) return empty;

  const supabase = createAdminSupabaseClient();
  const dateField = options.dateField ?? LOST_DATE_FIELD.ARCHIVED;

  let builder = supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("status_id", lostStatusId)
    .order("archived_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (dateField === LOST_DATE_FIELD.EVENT) {
    if (options.dateFrom) builder = builder.gte("event_date", options.dateFrom);
    if (options.dateTo) builder = builder.lte("event_date", options.dateTo);
  } else {
    if (options.dateFrom) {
      builder = builder.gte("archived_at", startOfCostaRicaDay(options.dateFrom));
    }
    if (options.dateTo) {
      builder = builder.lte("archived_at", endOfCostaRicaDay(options.dateTo));
    }
  }

  const { data, error } = await builder;

  if (error) {
    console.error("[getLostPipelineReport]", error.message);
    return empty;
  }

  const events = (data ?? []) as EventWithRelations[];
  if (events.length === 0) return empty;

  const totalsByEvent = await getQuoteTotalsByEventId(events.map((event) => event.id));
  const allRows: LostPipelineRow[] = events.map((event) => ({
    eventId: event.id,
    title: event.title,
    customerName: event.customers.name,
    eventDate: event.event_date,
    archivedAt: event.archived_at,
    lostReason: event.lost_reason,
    amount: totalsByEvent.get(event.id) ?? 0,
  }));

  const totalAmount = allRows.reduce((sum, row) => sum + row.amount, 0);
  const offset = (page - 1) * pageSize;

  return {
    totalAmount,
    totalCount: allRows.length,
    page,
    pageSize,
    rows: allRows.slice(offset, offset + pageSize),
  };
}

async function getQuoteTotalsByEventId(
  eventIds: string[],
): Promise<Map<string, number>> {
  const totals = new Map<string, number>();
  if (eventIds.length === 0) return totals;

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("event_id, total")
    .in("event_id", eventIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getQuoteTotalsByEventId]", error.message);
    return totals;
  }

  for (const quote of data ?? []) {
    if (!quote.event_id || totals.has(quote.event_id)) continue;
    totals.set(quote.event_id, Number(quote.total));
  }

  return totals;
}
