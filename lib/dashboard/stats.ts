import type { CustomerWithRelations, QuoteWithRelations } from "@/lib/supabase/types";

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

/** Monday 00:00 through Sunday 23:59 of the current week (local time). */
export function getWeekBounds(reference = new Date()): { start: Date; end: Date } {
  const day = reference.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(reference);
  monday.setDate(reference.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: startOfDay(monday), end: endOfDay(sunday) };
}

function isWithinRange(isoDate: string, start: Date, end: Date): boolean {
  const date = new Date(isoDate);
  return date >= start && date <= end;
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
  customers: CustomerWithRelations[],
  reference = new Date(),
): DashboardSummary {
  const { start, end } = getWeekBounds(reference);

  const quotesDaily = buildDailySeries(
    quotes,
    (q) => q.created_at,
    (q) => q.total,
    start,
    end,
  );

  const customersDaily = buildDailySeries(
    customers,
    (c) => c.created_at,
    () => 0,
    start,
    end,
  );

  return {
    quotesThisWeek: quotesDaily.reduce((sum, d) => sum + d.count, 0),
    quotesAmountThisWeek: quotesDaily.reduce((sum, d) => sum + d.amount, 0),
    newCustomersThisWeek: customersDaily.reduce((sum, d) => sum + d.count, 0),
    totalCustomers: customers.length,
    quotesDaily,
    customersDaily,
  };
}
