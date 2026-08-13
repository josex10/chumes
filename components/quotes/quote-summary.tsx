type QuoteSummaryProps = {
  subtotal: number;
  taxTotal: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function QuoteSummary({
  subtotal,
  taxTotal,
  discountAmount,
  deliveryFee,
  total,
}: QuoteSummaryProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <h3 className="mb-3 text-sm font-medium">Summary</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatCurrency(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tax</dt>
          <dd>{formatCurrency(taxTotal)}</dd>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-700">
            <dt>Discount</dt>
            <dd>-{formatCurrency(discountAmount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd>{formatCurrency(deliveryFee)}</dd>
        </div>
        <div className="flex justify-between border-t pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatCurrency(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
