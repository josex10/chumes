import { EVENT_PHASE } from "@/lib/events/constants";
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

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Monday 00:00 through Sunday 23:59 of the week containing reference (local time). */
export function getWeekBounds(reference = new Date()): { start: Date; end: Date } {
  const day = reference.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(reference);
  monday.setDate(reference.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: startOfDay(monday), end: endOfDay(sunday) };
}

export function getWeekKey(reference = new Date()): string {
  const { start } = getWeekBounds(reference);
  return start.toISOString().slice(0, 10);
}

export function parseWeekKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatWeekRange(start: Date, end: Date): string {
  const formatter = new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "short",
  });
  const yearFormatter = new Intl.DateTimeFormat("es-CR", { year: "numeric" });
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
  const date = startOfDay(new Date(`${dateStr}T12:00:00`));
  return date >= startOfDay(start) && date <= startOfDay(end);
}

function buildWeekDays(start: Date): { dayLabel: string; dateKey: string }[] {
  const formatter = new Intl.DateTimeFormat("es-CR", { weekday: "short" });
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      dayLabel: formatter.format(date).replace(".", ""),
      dateKey: date.toISOString().slice(0, 10),
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
    const dateKey = isoDate.slice(0, 10);
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
    const dateKey = event.created_at.slice(0, 10);
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
