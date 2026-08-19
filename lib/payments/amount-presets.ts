import { PAYMENT_QUICK_PERCENTAGES } from "@/lib/payments/constants";

export function roundPaymentAmount(amount: number): number {
  return Math.round(amount);
}

export function amountFromPendingPercentage(
  balanceDue: number,
  percentage: number,
): number {
  if (balanceDue <= 0 || percentage <= 0) return 0;
  return roundPaymentAmount((balanceDue * percentage) / 100);
}

export function getQuickAdvanceAmounts(balanceDue: number) {
  return PAYMENT_QUICK_PERCENTAGES.map((percentage) => ({
    percentage,
    amount: amountFromPendingPercentage(balanceDue, percentage),
  }));
}

export function getFullPendingAmount(balanceDue: number): number {
  return roundPaymentAmount(balanceDue);
}
