import { COSTA_RICA_TIMEZONE } from "@/lib/follow-ups/calendar";
import { roundMoney, sumMoney } from "@/lib/money";
import type { ExpenseCategory, ExpenseWithRelations } from "@/lib/supabase/types";

const dateTimeFormatter = new Intl.DateTimeFormat("es-CR", {
  timeZone: COSTA_RICA_TIMEZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatSpentAt(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

export type CategorySpend = {
  category: ExpenseCategory;
  total: number;
};

export function summarizeExpenses(
  expenses: ExpenseWithRelations[],
  categories: ExpenseCategory[],
): { total: number; byCategory: CategorySpend[] } {
  const totals = new Map<number, number>();

  for (const expense of expenses) {
    const current = totals.get(expense.category_id) ?? 0;
    totals.set(expense.category_id, sumMoney([current, expense.amount]));
  }

  const byCategory = categories
    .filter((category) => category.is_active || (totals.get(category.id) ?? 0) > 0)
    .map((category) => ({
      category,
      total: totals.get(category.id) ?? 0,
    }))
    .sort((left, right) => left.category.sort_order - right.category.sort_order);

  return {
    total: roundMoney(sumMoney(expenses.map((expense) => expense.amount))),
    byCategory,
  };
}

export function gastosHref(params: {
  tab?: "gastos" | "inversiones";
  week?: string | null;
  category?: number | null;
  method?: number | null;
}): string {
  const search = new URLSearchParams();
  if (params.tab === "inversiones") search.set("tab", "inversiones");
  if (params.week) search.set("week", params.week);
  if (params.category) search.set("category", String(params.category));
  if (params.method) search.set("method", String(params.method));
  const query = search.toString();
  return query ? `/gastos?${query}` : "/gastos";
}
