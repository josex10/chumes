import { DISCOUNT_TYPE } from "@/lib/quotes/constants";
import type { DiscountCode, Tax } from "@/lib/supabase/types";

export type QuoteLineInput = {
  quantity: number;
  unit_price: number;
  tax_rate: number;
};

export type QuoteTotalsInput = {
  lines: QuoteLineInput[];
  discountCode: Pick<DiscountCode, "discount_type" | "value"> | null;
  deliveryFee: number;
};

export type CalculatedLine = {
  line_subtotal: number;
  tax_amount: number;
  line_total: number;
};

export type CalculatedQuoteTotals = {
  subtotal: number;
  tax_total: number;
  discount_amount: number;
  delivery_fee: number;
  total: number;
  lines: CalculatedLine[];
};

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateLineTotals(line: QuoteLineInput): CalculatedLine {
  const line_subtotal = roundCurrency(line.quantity * line.unit_price);
  const tax_amount = roundCurrency(line_subtotal * line.tax_rate);
  const line_total = roundCurrency(line_subtotal + tax_amount);
  return { line_subtotal, tax_amount, line_total };
}

export function calculateDiscountAmount(
  subtotal: number,
  discountCode: Pick<DiscountCode, "discount_type" | "value"> | null,
): number {
  if (!discountCode || subtotal <= 0) return 0;
  if (discountCode.discount_type === DISCOUNT_TYPE.PERCENTAGE) {
    return roundCurrency(subtotal * (discountCode.value / 100));
  }
  return roundCurrency(Math.min(discountCode.value, subtotal));
}

export function calculateQuoteTotals(input: QuoteTotalsInput): CalculatedQuoteTotals {
  const lines = input.lines.map(calculateLineTotals);
  const subtotal = roundCurrency(lines.reduce((sum, line) => sum + line.line_subtotal, 0));
  const tax_total = roundCurrency(lines.reduce((sum, line) => sum + line.tax_amount, 0));
  const discount_amount = calculateDiscountAmount(subtotal, input.discountCode);
  const delivery_fee = roundCurrency(Math.max(input.deliveryFee, 0));
  const total = roundCurrency(subtotal + tax_total - discount_amount + delivery_fee);
  return { subtotal, tax_total, discount_amount, delivery_fee, total, lines };
}

export function getTaxRate(tax: Pick<Tax, "rate"> | null | undefined): number {
  return tax?.rate ?? 0;
}
