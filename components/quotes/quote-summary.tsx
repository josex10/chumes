import { formatCurrency } from "@/lib/quotes/format";

type QuoteSummaryProps = {
  subtotal: number;
  taxTotal: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;
};

export function QuoteSummary({
  subtotal,
  taxTotal,
  discountAmount,
  deliveryFee,
  total,
}: QuoteSummaryProps) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between gap-8">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="tabular-nums">{formatCurrency(subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-8">
        <dt className="text-muted-foreground">IVA</dt>
        <dd className="tabular-nums">{formatCurrency(taxTotal)}</dd>
      </div>
      {deliveryFee > 0 && (
        <div className="flex justify-between gap-8">
          <dt className="text-muted-foreground">Envío</dt>
          <dd className="tabular-nums">{formatCurrency(deliveryFee)}</dd>
        </div>
      )}
      {discountAmount > 0 && (
        <div className="flex justify-between gap-8">
          <dt className="text-muted-foreground">Descuento</dt>
          <dd className="tabular-nums">-{formatCurrency(discountAmount)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-8 border-t border-border/60 pt-3">
        <dt className="text-base font-semibold">Total</dt>
        <dd className="text-xl font-semibold tabular-nums">{formatCurrency(total)}</dd>
      </div>
    </dl>
  );
}
