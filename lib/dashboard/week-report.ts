import {
  formatWeekRange,
  getFinanceWeekStats,
  getWeekBounds,
  getWeekKey,
} from "@/lib/dashboard/stats";
import {
  addCalendarDays,
  COSTA_RICA_TIMEZONE,
  toCostaRicaDateKey,
  toEventDateKey,
} from "@/lib/follow-ups/calendar";
import { roundMoney, sumMoney } from "@/lib/money";
import type { EventWithRelations, ExpenseWithRelations } from "@/lib/supabase/types";

export type WeekReportDay = {
  dayLabel: string;
  dateKey: string;
  count: number;
};

export type WeekReportCategory = {
  name: string;
  total: number;
  /** Share of the week's expenses, from 0 to 1. */
  percent: number;
};

export type WeekReportEventRow = {
  id: string;
  title: string;
  customerName: string;
  dateLabel: string;
  amount: number;
};

export type WeekReportExpenseRow = {
  id: string;
  concept: string;
  paymentMethod: string;
  amount: number;
};

export type WeekReportBar =
  | { kind: "empty"; caption: string }
  | { kind: "loss"; caption: string }
  | { kind: "profit"; caption: string }
  | {
      kind: "split";
      expenseRatio: number;
      profitRatio: number;
      caption: string;
    };

export type WeekReport = {
  weekKey: string;
  weekRange: string;
  generatedLabel: string;
  eventCount: number;
  billed: number;
  collected: number;
  pending: number;
  expenseCount: number;
  expensesTotal: number;
  profit: number;
  /** Profit divided by billed. Null when nothing was billed. */
  margin: number | null;
  days: WeekReportDay[];
  categories: WeekReportCategory[];
  events: WeekReportEventRow[];
  expenseRows: WeekReportExpenseRow[];
  bar: WeekReportBar;
};

const ratioFormatter = new Intl.NumberFormat("es-CR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const generatedFormatter = new Intl.DateTimeFormat("es-CR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: COSTA_RICA_TIMEZONE,
});

const eventDateFormatter = new Intl.DateTimeFormat("es-CR", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function formatRatioLabel(ratio: number | null): string {
  if (ratio === null) return "—";
  return ratioFormatter.format(ratio);
}

export function eventCountLabel(count: number): string {
  return count === 1 ? "1 evento" : `${count} eventos`;
}

export function movementCountLabel(count: number): string {
  return count === 1 ? "1 movimiento" : `${count} movimientos`;
}

function cents(value: number): number {
  return Math.round(value * 100);
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

function formatEventDate(value: string): string {
  const dateKey = toEventDateKey(value);
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return value;
  return eventDateFormatter.format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function buildBar(billed: number, expensesTotal: number): WeekReportBar {
  const billedCents = cents(billed);
  const expenseCents = cents(expensesTotal);

  if (billedCents <= 0 && expenseCents <= 0) {
    return { kind: "empty", caption: "Sin facturación ni gastos esta semana" };
  }

  if (billedCents <= 0 || expenseCents > billedCents) {
    return { kind: "loss", caption: "Los gastos superan lo facturado" };
  }

  if (expenseCents <= 0) {
    return { kind: "profit", caption: "Sin gastos esta semana" };
  }

  if (expenseCents === billedCents) {
    return {
      kind: "split",
      expenseRatio: 1,
      profitRatio: 0,
      caption: "Los gastos igualan lo facturado",
    };
  }

  const expenseRatio = expenseCents / billedCents;
  const profitRatio = (billedCents - expenseCents) / billedCents;
  return {
    kind: "split",
    expenseRatio,
    profitRatio,
    caption: `Gastos ${formatRatioLabel(expenseRatio)} del facturado · Utilidad ${formatRatioLabel(profitRatio)}`,
  };
}

export function buildWeekReport(input: {
  reference?: Date;
  events: EventWithRelations[];
  expenses: ExpenseWithRelations[];
  generatedAt?: Date;
}): WeekReport {
  const reference = input.reference ?? new Date();
  const generatedAt = input.generatedAt ?? new Date();
  const { start, end } = getWeekBounds(reference);
  const finance = getFinanceWeekStats(input.events, reference, {
    includeWonArchived: true,
  });

  const expenses = input.expenses.filter((expense) => {
    const spentAt = new Date(expense.spent_at);
    return spentAt >= start && spentAt <= end;
  });

  const billed = roundMoney(finance.totalQuoteValue);
  const collected = roundMoney(finance.totalNetPaid);
  const pending = roundMoney(finance.totalBalanceDue);
  const expensesTotal = roundMoney(sumMoney(expenses.map((expense) => expense.amount)));
  const profit = roundMoney(billed - expensesTotal);

  const days = buildWeekDays(start);
  const counts = new Map(days.map((day) => [day.dateKey, 0]));
  for (const event of finance.events) {
    const dateKey = toEventDateKey(event.eventDate);
    if (!counts.has(dateKey)) continue;
    counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
  }

  const categoryTotals = new Map<number, { name: string; total: number }>();
  for (const expense of expenses) {
    const current = categoryTotals.get(expense.category_id);
    categoryTotals.set(expense.category_id, {
      name: expense.expense_categories?.name ?? current?.name ?? "Sin categoría",
      total: sumMoney([current?.total ?? 0, expense.amount]),
    });
  }

  const categories = Array.from(categoryTotals.values())
    .filter((category) => cents(category.total) > 0)
    .map((category) => ({
      name: category.name,
      total: category.total,
      percent: cents(expensesTotal) > 0 ? cents(category.total) / cents(expensesTotal) : 0,
    }))
    .sort((left, right) => right.total - left.total || left.name.localeCompare(right.name, "es"));

  const expenseRows = [...expenses]
    .sort(
      (left, right) =>
        left.spent_at.localeCompare(right.spent_at) || left.id.localeCompare(right.id),
    )
    .map((expense) => {
      const detail = expense.detail?.trim();
      return {
        id: expense.id,
        concept: detail || expense.expense_categories?.name || "Gasto",
        paymentMethod: expense.company_payment_methods?.name ?? "—",
        amount: roundMoney(expense.amount),
      };
    });

  return {
    weekKey: getWeekKey(reference),
    weekRange: formatWeekRange(start, end),
    generatedLabel: generatedFormatter.format(generatedAt),
    eventCount: finance.confirmedEventsCount,
    billed,
    collected,
    pending,
    expenseCount: expenseRows.length,
    expensesTotal,
    profit,
    margin: cents(billed) > 0 ? profit / billed : null,
    days: days.map((day) => ({
      dayLabel: day.dayLabel,
      dateKey: day.dateKey,
      count: counts.get(day.dateKey) ?? 0,
    })),
    categories,
    events: finance.events.map((event) => ({
      id: event.id,
      title: event.title,
      customerName: event.customerName,
      dateLabel: formatEventDate(event.eventDate),
      amount: roundMoney(event.quoteTotal),
    })),
    expenseRows,
    bar: buildBar(billed, expensesTotal),
  };
}
