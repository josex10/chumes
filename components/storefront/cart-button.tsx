"use client";

import Link from "next/link";
import { useCart } from "@/components/storefront/cart-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cotizar"
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "rounded-full px-4",
      )}
    >
      Cotizar{itemCount > 0 ? ` (${itemCount})` : ""}
    </Link>
  );
}
