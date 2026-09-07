import { EVENT_PHASE } from "@/lib/events/constants";
import {
  addCalendarDays,
  COSTA_RICA_OFFSET,
  COSTA_RICA_TIMEZONE,
  getCostaRicaWeekBounds,
  toCostaRicaDateKey,
} from "@/lib/follow-ups/calendar";
import type {
  CustomerWithRelations,
  EventSource,
  EventWithRelations,
  QuoteWithRelations,
} from "@/lib/supabase/types";

export type DailyPoint = {
  dayLabel: string;
  dateKey: string;
  count: number;
  amount: number;
};

export type DashboardSummary = {
  quotesThisWeek: number;
  quotesAmountThisWeek: number;
  newCustomersThisWeek: number;
  totalCustomers: number;
  quotesDaily: DailyPoint[];
  customersDaily: DailyPoint[];
};

export type LeadsDailyPoint = {
  dayLabel: string;
  dateKey: string;
  total: number;
  bySource: Record<string, number>;
};

export type SourceTotal = {
  sourceName: string;
  count: number;
};

export type LeadsWeekStats = {
  totalLeads: number;
  leadsDaily: LeadsDailyPoint[];
  sourceTotals: SourceTotal[];
};

export type ReservationsWeekStats = {
  totalReserved: number;
  totalReservedAmount: number;
  reservationsDaily: DailyPoint[];
};

export type FinanceEventRow = {
  id: string;
  title: string;
  customerName: string;
  eventDate: string;
  quoteTotal: number;
  netPaid: number;
  balanceDue: number;
  paymentStatus: string;
};

export type FinanceWeekStats = {
  confirmedEventsCount: number;
  totalQuoteValue: number;
  totalNetPaid: number;
  totalBalanceDue: number;
  totalOverpaid: number;
  events: FinanceEventRow[];
};

function startOfCostaRicaDay(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00${COSTA_RICA_OFFSET}`);
}

function endOfCostaRicaDay(dateKey: string): Date {
  return new Date(`${dateKey}T23:59:59.999${COSTA_RICA_OFFSET}`);
}

/** Monday 00:00 through Sunday 23:59 in Costa Rica of the week containing reference. */
export function getWeekBounds(reference = new Date()): { start: Date; end: Date } {
  const { startKey, endKey } = getCostaRicaWeekBounds(toCostaRicaDateKey(reference));
  return { start: startOfCostaRicaDay(startKey), end: endOfCostaRicaDay(endKey) };
}

export function getWeekKey(reference = new Date()): string {
  return getCostaRicaWeekBounds(toCostaRicaDateKey(reference)).startKey;
}

export function parseWeekKey(key: string): Date {
  return new Date(`${key}T12:00:00${COSTA_RICA_OFFSET}`);
}

export function formatWeekRange(start: Date, end: Date): string {
  const formatter = new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "short",
    timeZone: COSTA_RICA_TIMEZONE,
  });
  const yearFormatter = new Intl.DateTimeFormat("es-CR", {
    year: "numeric",
    timeZone: COSTA_RICA_TIMEZONE,
  });
  const startStr = formatter.format(start);
  const endStr = formatter.format(end);
  const year = yearFormatter.format(end);
  return `${startStr} – ${endStr} ${year}`;
}

function isWithinRange(isoDate: string, start: Date, end: Date): boolean {
  const date = new Date(isoDate);
  return date >= start && date <= end;
}

function isDateWithinRange(dateStr: string, start: Date, end: Date): boolean {
  const dateKey = dateStr.slice(0, 10);
  return dateKey >= toCostaRicaDateKey(start) && dateKey <= toCostaRicaDateKey(end);
}

function buildWeekDays(start: Date): { dayLabel: string; dateKey: string }[] {
  const startKey = toCostaRicaDateKey(start);
  const formatter = new Intl.DateTimeFormat("es-CR", {
    weekday: "short",
    timeZone: "UTC",
  });
  return Array.from({ length: 7 }, (_, index) => {
    const dateKey = addCalendarDays(startKey, index);
    const [year, month, day] = dateKey.split("-").map(Number);
    return {
      dayLabel: formatter
        .format(new Date(Date.UTC(year, month - 1, day, 12)))
        .replace(".", ""),
      dateKey,
    };
  });
}

function buildDailySeries<T>(
  items: T[],
  getDate: (item: T) => string,
  getAmount: (item: T) => number,
  weekStart: Date,
  weekEnd: Date,
): DailyPoint[] {
  const days = buildWeekDays(weekStart);
  const buckets = new Map<string, { count: number; amount: number }>(
    days.map((day) => [day.dateKey, { count: 0, amount: 0 }]),
  );

  for (const item of items) {
    const isoDate = getDate(item);
    if (!isWithinRange(isoDate, weekStart, weekEnd)) continue;
    const dateKey = toCostaRicaDateKey(isoDate);
    const bucket = buckets.get(dateKey);
    if (!bucket) continue;
    bucket.count += 1;
    bucket.amount += getAmount(item);
  }

  return days.map((day) => {
    const bucket = buckets.get(day.dateKey)!;
    return {
      dayLabel: day.dayLabel,
      dateKey: day.dateKey,
      count: bucket.count,
      amount: bucket.amount,
    };
  });
}

export function getDashboardSummary(
  quotes: QuoteWithRelations[],
  customersThisWeek: Pick<CustomerWithRelations, "id" | "created_at">[],
  totalCustomers: number,
  reference = new Date(),
): DashboardSummary {
  const { start, end } = getWeekBounds(reference);

  const quotesDaily = buildDailySeries(
    quotes,
    (q) => q.created_at,
    (q) => Number(q.total),
    start,
    end,
  );

  const customersDaily = buildDailySeries(
    customersThisWeek,
    (c) => c.created_at,
    () => 0,
    start,
    end,
  );

  return {
    quotesThisWeek: quotesDaily.reduce((sum, d) => sum + d.count, 0),
    quotesAmountThisWeek: quotesDaily.reduce((sum, d) => sum + d.amount, 0),
    newCustomersThisWeek: customersDaily.reduce((sum, d) => sum + d.count, 0),
    totalCustomers,
    quotesDaily,
    customersDaily,
  };
}

export function getLeadsWeekStats(
  events: EventWithRelations[],
  sources: EventSource[],
  reference = new Date(),
): LeadsWeekStats {
  const { start, end } = getWeekBounds(reference);
  const days = buildWeekDays(start);
  const sourceNames = sources.map((s) => s.name);

  const buckets = new Map<string, Record<string, number>>(
    days.map((day) => [
      day.dateKey,
      Object.fromEntries(sourceNames.map((name) => [name, 0])),
    ]),
  );

  const sourceCountTotals = new Map<string, number>(
    sourceNames.map((name) => [name, 0]),
  );

  for (const event of events) {
    if (!isWithinRange(event.created_at, start, end)) continue;
    const dateKey = toCostaRicaDateKey(event.created_at);
    const sourceName = event.event_sources?.name ?? "Otro";
    const dayBucket = buckets.get(dateKey);
    if (dayBucket) {
      dayBucket[sourceName] = (dayBucket[sourceName] ?? 0) + 1;
    }
    sourceCountTotals.set(sourceName, (sourceCountTotals.get(sourceName) ?? 0) + 1);
  }

  const leadsDaily: LeadsDailyPoint[] = days.map((day) => {
    const bySource = buckets.get(day.dateKey)!;
    return {
      dayLabel: day.dayLabel,
      dateKey: day.dateKey,
      total: Object.values(bySource).reduce((sum, c) => sum + c, 0),
      bySource,
    };
  });

  const sourceTotals = Array.from(sourceCountTotals.entries())
    .filter(([, count]) => count > 0)
    .map(([sourceName, count]) => ({ sourceName, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalLeads: leadsDaily.reduce((sum, d) => sum + d.total, 0),
    leadsDaily,
    sourceTotals,
  };
}

function getEventQuoteTotal(event: EventWithRelations): number {
  const quote = event.quotes?.[0];
  return quote ? Number(quote.total) : 0;
}

export function getReservationsWeekStats(
  events: EventWithRelations[],
  reference = new Date(),
): ReservationsWeekStats {
  const { start, end } = getWeekBounds(reference);

  const reservationsDaily = buildDailySeries(
    events.filter((e) => e.reserved_at),
    (e) => e.reserved_at!,
    getEventQuoteTotal,
    start,
    end,
  );

  return {
    totalReserved: reservationsDaily.reduce((sum, d) => sum + d.count, 0),
    totalReservedAmount: reservationsDaily.reduce((sum, d) => sum + d.amount, 0),
    reservationsDaily,
  };
}

export function getFinanceWeekStats(
  events: EventWithRelations[],
  reference = new Date(),
): FinanceWeekStats {
  const { start, end } = getWeekBounds(reference);

  const confirmedEvents = events.filter((event) => {
    if (!event.event_date) return false;
    if (event.event_statuses?.phase !== EVENT_PHASE.OPERATIONAL) return false;
    return isDateWithinRange(event.event_date, start, end);
  });

  let totalQuoteValue = 0;
  let totalNetPaid = 0;
  let totalBalanceDue = 0;
  let totalOverpaid = 0;

  const rows: FinanceEventRow[] = confirmedEvents.map((event) => {
    const quoteTotal = getEventQuoteTotal(event);
    const summary = event.payment_summary;
    const netPaid = summary?.netPaid ?? 0;
    const balanceDue = summary?.balanceDue ?? quoteTotal;
    const overpaid = summary?.overpaidAmount ?? 0;

    totalQuoteValue += quoteTotal;
    totalNetPaid += netPaid;
    totalBalanceDue += balanceDue;
    totalOverpaid += overpaid;

    return {
      id: event.id,
      title: event.title,
      customerName: event.customers?.name ?? "—",
      eventDate: event.event_date!,
      quoteTotal,
      netPaid,
      balanceDue,
      paymentStatus: summary?.paymentStatus ?? "PENDING",
    };
  });

  rows.sort((a, b) => a.eventDate.localeCompare(b.eventDate));

  return {
    confirmedEventsCount: rows.length,
    totalQuoteValue,
    totalNetPaid,
    totalBalanceDue,
    totalOverpaid,
    events: rows,
  };
}
