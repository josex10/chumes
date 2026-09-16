import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  buildProductReservationsHref,
  type ReservationDateOrder,
} from "@/lib/products/reservation-queries";
import { cn } from "@/lib/utils";

type ProductReservationsPaginationProps = {
  productId: string;
  page: number;
  totalPages: number;
  weekKey: string;
  dateOrder: ReservationDateOrder;
};

export function ProductReservationsPagination({
  productId,
  page,
  totalPages,
  weekKey,
  dateOrder,
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
            href={buildProductReservationsHref(productId, {
              page: page - 1,
              weekKey,
              dateOrder,
            })}
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
            href={buildProductReservationsHref(productId, {
              page: page + 1,
              weekKey,
              dateOrder,
            })}
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
