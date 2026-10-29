import { getProfileNameMap } from "@/lib/profiles/names";
import { remainingMoney, roundMoney, sumMoney } from "@/lib/money";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { InvestmentCreditor, InvestmentStatus } from "@/lib/supabase/types";
import type {
  InvestmentListItem,
  InvestmentPaymentItem,
} from "@/lib/investments/types";

const INVESTMENT_SELECT = `
  *,
  investment_creditors(*),
  investment_payments(
    *,
    company_payment_methods(*)
  )
`;

type InvestmentRow = {
  id: string;
  creditor_id: number;
  title: string;
  amount: number | string;
  invested_on: string;
  status: InvestmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  investment_creditors: InvestmentCreditor;
  investment_payments: Array<
    Omit<InvestmentPaymentItem, "amount" | "created_by_name"> & {
      amount: number | string;
    }
  >;
};

export async function getInvestmentCreditors(): Promise<InvestmentCreditor[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("investment_creditors")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[getInvestmentCreditors]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getInvestments(): Promise<InvestmentListItem[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("investments")
    .select(INVESTMENT_SELECT)
    .order("invested_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getInvestments]", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as InvestmentRow[];
  const names = await getProfileNameMap(
    rows.flatMap((row) => row.investment_payments.map((payment) => payment.created_by)),
  );

  return rows
    .map((row): InvestmentListItem => {
      const payments: InvestmentPaymentItem[] = [...row.investment_payments]
        .map((payment) => ({
          ...payment,
          amount: roundMoney(Number(payment.amount)),
          created_by_name: payment.created_by
            ? (names.get(payment.created_by) ?? "Usuario")
            : null,
        }))
        .sort((left, right) => right.paid_at.localeCompare(left.paid_at));

      const amount = roundMoney(Number(row.amount));
      const paid = sumMoney(payments.map((payment) => payment.amount));
      const remaining = remainingMoney(amount, paid);

      return {
        id: row.id,
        creditor_id: row.creditor_id,
        title: row.title,
        amount,
        invested_on: row.invested_on,
        status: remaining === 0 ? "SETTLED" : "OPEN",
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        created_by: row.created_by,
        updated_by: row.updated_by,
        investment_creditors: row.investment_creditors,
        payments,
        paid,
        remaining,
      };
    })
    .sort((left, right) => {
      if (left.status !== right.status) return left.status === "OPEN" ? -1 : 1;
      return right.invested_on.localeCompare(left.invested_on);
    });
}
