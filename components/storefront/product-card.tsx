import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/quotes/format";
import { QUOTE_LINE_TYPE } from "@/lib/quotes/constants";
import type { PublicProduct } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: PublicProduct;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const prices: string[] = [];

  if (product.rental_available && product.rental_price != null) {
    prices.push(`Alquiler ${formatCurrency(product.rental_price)}`);
  }

  if (product.sale_available && product.sale_price != null) {
    prices.push(`Venta ${formatCurrency(product.sale_price)}`);
  }

  return (
    <Link
      href={`/catalogo/${product.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.primary_image_url ? (
          <Image
            src={product.primary_image_url}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
            {product.product_categories.name}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {product.product_categories.name}
        </p>
        <h3 className="text-lg font-medium leading-snug">{product.name}</h3>
        {prices.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {prices.map((price) => (
              <span
                key={price}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
              >
                {price}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export function ProductPriceBadges({ product }: { product: PublicProduct }) {
  const badges = [];

  if (product.rental_available && product.rental_price != null) {
    badges.push({
      label: "Alquiler",
      value: formatCurrency(product.rental_price),
      lineType: QUOTE_LINE_TYPE.RENTAL,
    });
  }

  if (product.sale_available && product.sale_price != null) {
    badges.push({
      label: "Venta",
      value: formatCurrency(product.sale_price),
      lineType: QUOTE_LINE_TYPE.SALE,
    });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="rounded-2xl border border-border/70 bg-card px-4 py-3"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {badge.label}
          </p>
          <p className="mt-1 text-lg font-semibold">{badge.value}</p>
        </div>
      ))}
    </div>
  );
}
