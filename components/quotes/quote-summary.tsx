import { formatCurrency } from "@/lib/quotes/format";

type QuoteSummaryProps = {
  subtotal: number;
  taxableSubtotal: number;
  taxTotal: number;
  discountAmount: number;
  total: number;
};

export function QuoteSummary({
  subtotal,
  taxableSubtotal,
  taxTotal,
  discountAmount,
  total,
}: QuoteSummaryProps) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between gap-8">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="tabular-nums">{formatCurrency(subtotal)}</dd>
      </div>
      {discountAmount > 0 && (
        <div className="flex justify-between gap-8">
          <dt className="text-muted-foreground">Descuento</dt>
          <dd className="tabular-nums">-{formatCurrency(discountAmount)}</dd>
        </div>
      )}
      {discountAmount > 0 && (
        <div className="flex justify-between gap-8">
          <dt className="text-muted-foreground">Base imponible</dt>
          <dd className="tabular-nums">{formatCurrency(taxableSubtotal)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-8">
        <dt className="text-muted-foreground">IVA</dt>
        <dd className="tabular-nums">{formatCurrency(taxTotal)}</dd>
      </div>
      <div className="flex justify-between gap-8 border-t border-border/60 pt-3">
        <dt className="text-base font-semibold">Total</dt>
        <dd className="text-xl font-semibold tabular-nums">{formatCurrency(total)}</dd>
      </div>
    </dl>
  );
}
