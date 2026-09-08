"use client";

import Link from "next/link";
import { useCart } from "@/components/storefront/cart-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const { itemCount } = useCart();

  if (itemCount === 0) {
    return null;
  }

  return (
    <Link
      href="/cotizar#evento"
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "rounded-full border-arena px-4 text-sm font-semibold tracking-wide",
        className,
      )}
    >
      Mi evento ({itemCount})
    </Link>
  );
}
