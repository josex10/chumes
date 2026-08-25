import Link from "next/link";
import {
  EVENTS_PIPELINE_TAB,
  type EventArchiveType,
} from "@/lib/events/constants";
import { buildEventsHref } from "@/lib/events/events-url";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EventsHistoryPaginationProps = {
  page: number;
  totalPages: number;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  archiveType?: EventArchiveType;
};

export function EventsHistoryPagination({
  page,
  totalPages,
  customerId,
  dateFrom,
  dateTo,
  archiveType,
}: EventsHistoryPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  function hrefFor(nextPage: number) {
    return buildEventsHref({
      tab: EVENTS_PIPELINE_TAB.HISTORY,
      customerId,
      dateFrom,
      dateTo,
      archiveType,
      page: nextPage,
    });
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={hrefFor(page - 1)}
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
            href={hrefFor(page + 1)}
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
