"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/storefront/cart-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QUOTE_LINE_TYPE } from "@/lib/quotes/constants";
import type { PublicProduct } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type AddToQuoteProps = {
  product: PublicProduct;
};

export function AddToQuotePanel({ product }: AddToQuoteProps) {
  const { addItem } = useCart();
  const defaultLineType = product.rental_available
    ? QUOTE_LINE_TYPE.RENTAL
    : QUOTE_LINE_TYPE.SALE;
  const [lineType, setLineType] = useState<
    typeof QUOTE_LINE_TYPE.RENTAL | typeof QUOTE_LINE_TYPE.SALE
  >(defaultLineType);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const unitPrice =
    lineType === QUOTE_LINE_TYPE.RENTAL
      ? product.rental_price
      : product.sale_price;

  function handleAdd() {
    if (unitPrice == null) {
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      lineType,
      unitPrice,
      rentalAvailable: product.rental_available,
      saleAvailable: product.sale_available,
      imageUrl: product.primary_image_url,
      quantity,
    });
    setAdded(true);
  }

  return (
    <div className="border border-arena/80 bg-ivory p-6">
      <h2 className="font-heading text-2xl">Agregalo a tu evento</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        ¿No sabés cuántas mesas necesitás? Poné una cantidad aproximada; te
        ayudamos a calcularlo.
      </p>

      {product.rental_available && product.sale_available ? (
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            className={cn(
              "h-10 rounded-full px-4 text-sm",
              lineType === QUOTE_LINE_TYPE.RENTAL
                ? "bg-brand text-ivory"
                : "border border-arena",
            )}
            onClick={() => setLineType(QUOTE_LINE_TYPE.RENTAL)}
          >
            Alquiler
          </button>
          <button
            type="button"
            className={cn(
              "h-10 rounded-full px-4 text-sm",
              lineType === QUOTE_LINE_TYPE.SALE
                ? "bg-brand text-ivory"
                : "border border-arena",
            )}
            onClick={() => setLineType(QUOTE_LINE_TYPE.SALE)}
          >
            Venta
          </button>
        </div>
      ) : null}

      <div className="mt-5 space-y-2">
        <Label htmlFor="quantity">Cantidad</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
        />
      </div>

      <button
        type="button"
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand text-sm text-ivory hover:bg-brand-deep disabled:opacity-50"
        onClick={handleAdd}
        disabled={unitPrice == null}
      >
        {added ? "Agregado" : "Agregar a mi evento"}
      </button>

      {added ? (
        <Link
          href="/cotizar#evento"
          className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-full border border-arena text-sm text-brand"
        >
          Ver mi evento
        </Link>
      ) : null}
    </div>
  );
}
