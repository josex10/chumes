"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { useCart } from "@/components/storefront/cart-provider";
import { QUOTE_LINE_TYPE } from "@/lib/quotes/constants";
import type { PublicProduct } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type AddToEventButtonProps = {
  product: PublicProduct;
  quantity?: number;
  className?: string;
  label?: string;
};

export function AddToEventButton({
  product,
  quantity = 1,
  className,
  label = "Agregar a mi evento",
}: AddToEventButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const lineType = product.rental_available
    ? QUOTE_LINE_TYPE.RENTAL
    : QUOTE_LINE_TYPE.SALE;
  const unitPrice =
    lineType === QUOTE_LINE_TYPE.RENTAL
      ? product.rental_price
      : product.sale_price;

  if (unitPrice == null) {
    return (
      <Link
        href={`/catalogo/${product.slug}`}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-full border border-arena px-5 text-sm text-brand",
          className,
        )}
      >
        Ver producto
      </Link>
    );
  }

  const price = unitPrice;

  function handleAdd(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      lineType,
      unitPrice: price,
      rentalAvailable: product.rental_available,
      saleAvailable: product.sale_available,
      imageUrl: product.primary_image_url,
      quantity,
    });
    setAdded(true);
  }

  if (added) {
    return (
      <Link
        href="/cotizar#evento"
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm text-ivory",
          className,
        )}
      >
        Ver mi evento
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm text-ivory transition hover:bg-brand-deep",
        className,
      )}
    >
      {label}
    </button>
  );
}
