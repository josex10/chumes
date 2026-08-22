"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/storefront/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QUOTE_LINE_TYPE } from "@/lib/quotes/constants";
import type { PublicProduct } from "@/lib/supabase/types";

type AddToQuoteProps = {
  product: PublicProduct;
};

export function AddToQuotePanel({ product }: AddToQuoteProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const defaultLineType = product.rental_available
    ? QUOTE_LINE_TYPE.RENTAL
    : QUOTE_LINE_TYPE.SALE;
  const [lineType, setLineType] = useState<
    typeof QUOTE_LINE_TYPE.RENTAL | typeof QUOTE_LINE_TYPE.SALE
  >(defaultLineType);
  const [quantity, setQuantity] = useState(1);

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

    router.push("/cotizar");
  }

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6">
      <h2 className="text-lg font-semibold">Agregar a cotización</h2>

      {product.rental_available && product.sale_available ? (
        <div className="mt-4 space-y-2">
          <Label>Tipo</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={lineType === QUOTE_LINE_TYPE.RENTAL ? "commit" : "outline"}
              onClick={() => setLineType(QUOTE_LINE_TYPE.RENTAL)}
            >
              Alquiler
            </Button>
            <Button
              type="button"
              variant={lineType === QUOTE_LINE_TYPE.SALE ? "commit" : "outline"}
              onClick={() => setLineType(QUOTE_LINE_TYPE.SALE)}
            >
              Venta
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        <Label htmlFor="quantity">Cantidad</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
        />
      </div>

      <Button
        type="button"
        variant="commit"
        className="mt-6 w-full rounded-full"
        onClick={handleAdd}
        disabled={unitPrice == null}
      >
        Agregar a cotización
      </Button>
    </div>
  );
}
