import Link from "next/link";
import { AddToEventButton } from "@/components/storefront/add-to-event-button";
import { StorefrontImage } from "@/components/storefront/storefront-image";
import { formatCurrency } from "@/lib/quotes/format";
import { QUOTE_LINE_TYPE } from "@/lib/quotes/constants";
import { getCatalogUnitPrice } from "@/lib/storefront/catalog";
import type { StorefrontPlaceholderKey } from "@/lib/storefront/media";
import type { PublicProduct } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: PublicProduct;
  className?: string;
};

function placeholderForProduct(product: PublicProduct): StorefrontPlaceholderKey {
  const code = product.product_categories.code;
  if (code === "TABLES") return "categoria-mesas";
  if (code === "CHAIRS") return "categoria-sillas";
  if (code === "TABLE_LINENS") return "manteleria-estilo";
  if (code === "COCKTAIL_TABLES") return "categoria-cocteleras";
  if (code === "TENTS") return "categoria-toldos";
  if (product.product_types.code === "BUNDLE") return "categoria-combos";
  return "inspiracion-detalle";
}

export function ProductCard({ product, className }: ProductCardProps) {
  const unitPrice = getCatalogUnitPrice(product);

  return (
    <article className={cn("group flex flex-col", className)}>
      <Link href={`/catalogo/${product.slug}`} className="block">
        <StorefrontImage
          src={product.primary_image_url}
          alt={product.name}
          placeholder={placeholderForProduct(product)}
          className="aspect-[4/5]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <p className="mt-4 text-[0.7rem] tracking-[0.22em] text-muted-foreground uppercase">
          {product.product_categories.name}
        </p>
        <h3 className="font-heading mt-2 text-2xl leading-snug">{product.name}</h3>
        {product.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        ) : null}
        {unitPrice != null ? (
          <p className="mt-3 text-sm">Desde {formatCurrency(unitPrice)}</p>
        ) : null}
      </Link>
      <div className="mt-4">
        <AddToEventButton product={product} className="w-full" />
      </div>
    </article>
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
        <div key={badge.label} className="border border-arena/80 bg-ivory px-4 py-3">
          <p className="text-[0.7rem] tracking-[0.18em] text-muted-foreground uppercase">
            {badge.label}
          </p>
          <p className="font-heading mt-1 text-2xl">{badge.value}</p>
        </div>
      ))}
    </div>
  );
}
