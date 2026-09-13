import Link from "next/link";
import { PRODUCT_EDIT_TAB } from "@/lib/products/constants";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductReservationsPaginationProps = {
  productId: string;
  page: number;
  totalPages: number;
  pageKey: "op" | "com";
  otherKey: "op" | "com";
  otherPage: number;
};

function buildHref(
  productId: string,
  pageKey: "op" | "com",
  page: number,
  otherKey: "op" | "com",
  otherPage: number,
) {
  const params = new URLSearchParams();
  params.set("tab", PRODUCT_EDIT_TAB.RESERVATIONS);

  if (page > 1) {
    params.set(pageKey, String(page));
  }

  if (otherPage > 1) {
    params.set(otherKey, String(otherPage));
  }

  return `/products/${productId}/edit?${params.toString()}`;
}

export function ProductReservationsPagination({
  productId,
  page,
  totalPages,
  pageKey,
  otherKey,
  otherPage,
}: ProductReservationsPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(productId, pageKey, page - 1, otherKey, otherPage)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Anterior
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50",
            )}
          >
            Anterior
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={buildHref(productId, pageKey, page + 1, otherKey, otherPage)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Siguiente
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50",
            )}
          >
            Siguiente
          </span>
        )}
      </div>
    </div>
  );
}
