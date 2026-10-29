import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { roundMoney } from "@/lib/money";
import type {
  CompanyPaymentMethod,
  ExpenseCategory,
  ExpenseWithRelations,
} from "@/lib/supabase/types";

const EXPENSE_SELECT = `
  *,
  expense_categories(*),
  company_payment_methods(*)
`;

function asMoney(value: number | string): number {
  return roundMoney(Number(value));
}

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("expense_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[getExpenseCategories]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCompanyPaymentMethods(): Promise<CompanyPaymentMethod[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("company_payment_methods")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[getCompanyPaymentMethods]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getExpensesBetween(
  start: Date,
  end: Date,
): Promise<ExpenseWithRelations[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("expenses")
    .select(EXPENSE_SELECT)
    .gte("spent_at", start.toISOString())
    .lte("spent_at", end.toISOString())
    .order("spent_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getExpensesBetween]", error.message);
    return [];
  }

  return ((data ?? []) as ExpenseWithRelations[]).map((expense) => ({
    ...expense,
    amount: asMoney(expense.amount),
  }));
}
