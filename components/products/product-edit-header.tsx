import Link from "next/link";
import { ArrowLeft, ExternalLink, Layers, Package } from "lucide-react";
import { ProductStatusToggles } from "@/components/products/product-status-toggles";
import { PRODUCT_TYPE } from "@/lib/products/constants";
import type { ProductWithRelations } from "@/lib/supabase/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductEditHeaderProps = {
  product: ProductWithRelations;
};

export function ProductEditHeader({ product }: ProductEditHeaderProps) {
  const isBundle = product.product_types.code === PRODUCT_TYPE.BUNDLE;
  const TypeIcon = isBundle ? Layers : Package;

  return (
    <div className="flex flex-col gap-5 border-b border-border/60 pb-6">
      <Link
        href="/products"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a productos
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{product.product_number}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <TypeIcon className="size-3.5" />
              {isBundle ? "Paquete" : "Simple"}
            </span>
            <span>·</span>
            <span>{product.product_categories.name}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {product.is_public ? (
            <a
              href={`/catalogo/${product.slug}`}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "inline-flex items-center gap-1.5",
              )}
            >
              <ExternalLink className="size-3.5" />
              Ver en el sitio web
            </a>
          ) : null}
          <ProductStatusToggles
            productId={product.id}
            initialIsActive={product.is_active}
            initialIsPublic={product.is_public}
          />
        </div>
      </div>
    </div>
  );
}
