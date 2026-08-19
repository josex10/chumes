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
  manualDiscount: Pick<DiscountCode, "discount_type" | "value"> | null;
  deliveryFee: number;
  deliveryTaxRate: number;
};

export type CalculatedLine = {
  line_subtotal: number;
  discount_share: number;
  taxable_subtotal: number;
  tax_amount: number;
  line_total: number;
};

export type CalculatedQuoteTotals = {
  subtotal: number;
  taxable_subtotal: number;
  tax_total: number;
  discount_amount: number;
  delivery_fee: number;
  delivery_tax_amount: number;
  delivery_line_total: number;
  total: number;
  lines: CalculatedLine[];
};

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateLineTotals(line: QuoteLineInput): CalculatedLine {
  const line_subtotal = roundCurrency(line.quantity * line.unit_price);
  return {
    line_subtotal,
    discount_share: 0,
    taxable_subtotal: line_subtotal,
    tax_amount: roundCurrency(line_subtotal * line.tax_rate),
    line_total: roundCurrency(line_subtotal + line_subtotal * line.tax_rate),
  };
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

function allocateDiscountShare(
  lineSubtotal: number,
  grossSubtotal: number,
  discountAmount: number,
  allocatedDiscount: number,
  isRemainderLine: boolean,
): number {
  if (discountAmount <= 0 || grossSubtotal <= 0 || lineSubtotal <= 0) return 0;
  if (isRemainderLine) {
    return roundCurrency(Math.max(discountAmount - allocatedDiscount, 0));
  }
  return roundCurrency(discountAmount * (lineSubtotal / grossSubtotal));
}

function calculateNetLine(
  lineSubtotal: number,
  taxRate: number,
  discountShare: number,
): CalculatedLine {
  const taxable_subtotal = roundCurrency(Math.max(lineSubtotal - discountShare, 0));
  const tax_amount = roundCurrency(taxable_subtotal * taxRate);
  const line_total = roundCurrency(taxable_subtotal + tax_amount);
  return {
    line_subtotal: lineSubtotal,
    discount_share: discountShare,
    taxable_subtotal,
    tax_amount,
    line_total,
  };
}

export function calculateQuoteTotals(input: QuoteTotalsInput): CalculatedQuoteTotals {
  const delivery_fee = roundCurrency(Math.max(input.deliveryFee, 0));
  const productInputs = input.lines.map((line) => ({
    ...line,
    line_subtotal: roundCurrency(line.quantity * line.unit_price),
  }));

  const grossSubtotal = roundCurrency(
    productInputs.reduce((sum, line) => sum + line.line_subtotal, 0) + delivery_fee,
  );

  const discount_amount = input.manualDiscount
    ? calculateDiscountAmount(grossSubtotal, input.manualDiscount)
    : calculateDiscountAmount(grossSubtotal, input.discountCode);

  let allocatedDiscount = 0;
  const hasDelivery = delivery_fee > 0;

  const lines = productInputs.map((line, index) => {
    const isRemainderLine = !hasDelivery && index === productInputs.length - 1;
    const discountShare = allocateDiscountShare(
      line.line_subtotal,
      grossSubtotal,
      discount_amount,
      allocatedDiscount,
      isRemainderLine,
    );
    allocatedDiscount = roundCurrency(allocatedDiscount + discountShare);
    return calculateNetLine(line.line_subtotal, line.tax_rate, discountShare);
  });

  let delivery_tax_amount = 0;
  let delivery_line_total = delivery_fee;

  if (hasDelivery) {
    const deliveryDiscountShare = allocateDiscountShare(
      delivery_fee,
      grossSubtotal,
      discount_amount,
      allocatedDiscount,
      true,
    );
    const deliveryNet = calculateNetLine(
      delivery_fee,
      input.deliveryTaxRate,
      deliveryDiscountShare,
    );
    delivery_tax_amount = deliveryNet.tax_amount;
    delivery_line_total = deliveryNet.line_total;
  }

  const tax_total = roundCurrency(
    lines.reduce((sum, line) => sum + line.tax_amount, 0) + delivery_tax_amount,
  );
  const taxable_subtotal = roundCurrency(grossSubtotal - discount_amount);
  const total = roundCurrency(taxable_subtotal + tax_total);

  return {
    subtotal: grossSubtotal,
    taxable_subtotal,
    tax_total,
    discount_amount,
    delivery_fee,
    delivery_tax_amount,
    delivery_line_total,
    total,
    lines,
  };
}

export function getTaxRate(tax: Pick<Tax, "rate"> | null | undefined): number {
  return tax?.rate ?? 0;
}
