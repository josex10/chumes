import Link from "next/link";
import { PRODUCT_EDIT_TAB } from "@/lib/products/constants";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductReservationsPaginationProps = {
  productId: string;
  page: number;
  totalPages: number;
};

function buildHref(productId: string, page: number) {
  const params = new URLSearchParams();
  params.set("tab", PRODUCT_EDIT_TAB.RESERVATIONS);

  if (page > 1) {
    params.set("page", String(page));
  }

  return `/products/${productId}/edit?${params.toString()}`;
}

export function ProductReservationsPagination({
  productId,
  page,
  totalPages,
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
            href={buildHref(productId, page - 1)}
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
            href={buildHref(productId, page + 1)}
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
