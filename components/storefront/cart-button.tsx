"use client";

import Link from "next/link";
import { useCart } from "@/components/storefront/cart-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cotizar"
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "rounded-full border-arena px-4 text-sm font-semibold tracking-wide",
        className,
      )}
    >
      Mi evento{itemCount > 0 ? ` (${itemCount})` : ""}
    </Link>
  );
}
