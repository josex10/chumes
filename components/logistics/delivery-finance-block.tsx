import { PAYMENT_STATUS, PAYMENT_STATUS_LABELS } from "@/lib/payments/constants";
import { formatCurrency } from "@/lib/quotes/format";
import type { PaymentSummary } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type DeliveryFinanceBlockProps = {
  summary: PaymentSummary | null;
  compact?: boolean;
};

export function DeliveryFinanceBlock({
  summary,
  compact = false,
}: DeliveryFinanceBlockProps) {
  if (!summary) {
    return (
      <div className="rounded-lg border border-dashed px-3 py-3 text-sm text-muted-foreground">
        Sin cotización vinculada para cobrar.
      </div>
    );
  }

  const isPaid = summary.paymentStatus === PAYMENT_STATUS.PAID;

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3",
        isPaid
          ? "border-emerald-600/30 bg-emerald-500/10"
          : "border-amber-600/30 bg-amber-500/10",
      )}
    >
      <p className="text-xs font-medium tracking-wide uppercase">
        {isPaid ? PAYMENT_STATUS_LABELS.PAID : "Saldo a cobrar"}
      </p>
      <p
        className={cn(
          "mt-1 font-semibold tabular-nums tracking-tight",
          compact ? "text-xl" : "text-2xl",
        )}
      >
        {formatCurrency(isPaid ? summary.quoteTotal : summary.balanceDue)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Total {formatCurrency(summary.quoteTotal)} · Adelantos{" "}
        {formatCurrency(summary.netPaid)}
      </p>
    </div>
  );
}
