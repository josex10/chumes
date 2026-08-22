import type { Metadata } from "next";
import Link from "next/link";
import { CartProvider } from "@/components/storefront/cart-provider";
import {
  StorefrontFooter,
  StorefrontHeader,
} from "@/components/storefront/site-chrome";
import { CHUMES_STOREFRONT } from "@/lib/storefront/company";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: CHUMES_STOREFRONT.name,
    template: `%s | ${CHUMES_STOREFRONT.name}`,
  },
  description: CHUMES_STOREFRONT.description,
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <div className="flex min-h-full flex-col bg-[radial-gradient(circle_at_top,_rgba(120,90,60,0.08),_transparent_45%)]">
        <StorefrontHeader />
        <div className="flex-1">{children}</div>
        <StorefrontFooter />
      </div>
    </CartProvider>
  );
}

export function StoreHero({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-16 md:py-24">
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground">{description}</p>
      {primaryHref && primaryLabel ? (
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={primaryHref}
            className={cn(
              buttonVariants({ variant: "commit", size: "lg" }),
              "rounded-full px-8",
            )}
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full px-8",
              )}
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
