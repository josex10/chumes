import type {
  CompanyPaymentMethod,
  Investment,
  InvestmentCreditor,
  InvestmentPayment,
  InvestmentStatus,
} from "@/lib/supabase/types";

export type InvestmentPaymentItem = InvestmentPayment & {
  company_payment_methods: CompanyPaymentMethod;
  created_by_name: string | null;
};

export type InvestmentListItem = Investment & {
  investment_creditors: InvestmentCreditor;
  payments: InvestmentPaymentItem[];
  paid: number;
  remaining: number;
  status: InvestmentStatus;
};
