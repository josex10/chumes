"use client";

import { useCart, type CartLineType } from "@/components/storefront/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/quotes/format";
import { QUOTE_LINE_TYPE } from "@/lib/quotes/constants";

function lineTypeLabel(lineType: CartLineType) {
  return lineType === QUOTE_LINE_TYPE.RENTAL ? "Alquiler" : "Venta";
}

export function QuoteSummary() {
  const { items, updateQuantity, removeItem } = useCart();
  const subtotal = items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  );

  return (
    <section id="evento" className="scroll-mt-32 border border-arena/80 bg-ivory p-6 md:p-8">
      <p className="text-[0.7rem] tracking-[0.22em] text-brand-gold uppercase">
        Resumen
      </p>
      <h2 className="font-heading mt-2 text-3xl">Mi evento</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Elegí tus favoritos. Podés ajustar cantidades antes de enviar.
      </p>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.lineType}`}
            className="flex flex-col gap-4 border-b border-arena/60 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {lineTypeLabel(item.lineType)} · {formatCurrency(item.unitPrice)}{" "}
                c/u
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="1"
                aria-label={`Cantidad de ${item.name}`}
                value={item.quantity}
                onChange={(event) =>
                  updateQuantity(
                    item.productId,
                    item.lineType,
                    Number(event.target.value),
                  )
                }
                className="w-24"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeItem(item.productId, item.lineType)}
              >
                Quitar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal referencial</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Los precios son referenciales. Confirmamos entrega, disponibilidad e
        impuestos en la cotización final.
      </p>
    </section>
  );
}
