import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getWeekKey } from "@/lib/dashboard/stats";
import { addCalendarDays } from "@/lib/follow-ups/calendar";
import {
  buildProductReservationsHref,
  type ReservationDateOrder,
} from "@/lib/products/reservation-queries";
import { cn } from "@/lib/utils";

type ProductReservationsWeekPickerProps = {
  productId: string;
  weekKey: string;
  weekRange: string;
  dateOrder: ReservationDateOrder;
};

export function ProductReservationsWeekPicker({
  productId,
  weekKey,
  weekRange,
  dateOrder,
}: ProductReservationsWeekPickerProps) {
  const currentWeekKey = getWeekKey();
  const isCurrentWeek = weekKey === currentWeekKey;

  return (
    <div className="flex items-center gap-2">
      <Link
        href={buildProductReservationsHref(productId, {
          weekKey: addCalendarDays(weekKey, -7),
          dateOrder,
        })}
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        aria-label="Semana anterior"
      >
        <ChevronLeft className="size-4" />
      </Link>

      <div className="flex min-w-[180px] flex-col items-center">
        <span className="text-sm font-medium">{weekRange}</span>
        {!isCurrentWeek ? (
          <Link
            href={buildProductReservationsHref(productId, { dateOrder })}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Ir a esta semana
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">Esta semana</span>
        )}
      </div>

      <Link
        href={buildProductReservationsHref(productId, {
          weekKey: addCalendarDays(weekKey, 7),
          dateOrder,
        })}
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        aria-label="Semana siguiente"
      >
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
