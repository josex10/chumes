import { EventsCollapsibleFilters } from "@/components/events/events-collapsible-filters";
import { EventsHistoryFilters } from "@/components/events/events-history-filters";
import { EventsHistoryPagination } from "@/components/events/events-history-pagination";
import { EventsHistoryTable } from "@/components/events/events-history-table";
import type { EventArchiveType } from "@/lib/events/constants";
import type {
  CustomerWithRelations,
  EventWithRelations,
} from "@/lib/supabase/types";
import type { ReactNode } from "react";

type EventsHistoryPanelProps = {
  events: EventWithRelations[];
  total: number;
  page: number;
  totalPages: number;
  customerId?: string;
  defaultCustomer?: CustomerWithRelations | null;
  dateFrom?: string;
  dateTo?: string;
  archiveType?: EventArchiveType;
  tabs: ReactNode;
  hasActiveFilters?: boolean;
};

export function EventsHistoryPanel({
  events,
  total,
  page,
  totalPages,
  customerId,
  defaultCustomer,
  dateFrom,
  dateTo,
  archiveType,
  tabs,
  hasActiveFilters = false,
}: EventsHistoryPanelProps) {
  return (
    <section className="space-y-4">
      <EventsCollapsibleFilters
        hasActiveFilters={hasActiveFilters}
        toolbar={tabs}
      >
        <EventsHistoryFilters
          customerId={customerId}
          defaultCustomer={defaultCustomer}
          dateFrom={dateFrom}
          dateTo={dateTo}
          archiveType={archiveType}
        />
      </EventsCollapsibleFilters>

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">
            No hay eventos archivados con estos filtros.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {total} evento{total === 1 ? "" : "s"} archivado
            {total === 1 ? "" : "s"}
          </p>
          <EventsHistoryTable events={events} />
          <EventsHistoryPagination
            page={page}
            totalPages={totalPages}
            customerId={customerId}
            dateFrom={dateFrom}
            dateTo={dateTo}
            archiveType={archiveType}
          />
        </>
      )}
    </section>
  );
}
