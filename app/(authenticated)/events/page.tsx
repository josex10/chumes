import Link from "next/link";
import { Suspense } from "react";
import { CalendarDays, Landmark, Plus, Settings2 } from "lucide-react";
import { EventsCollapsibleFilters } from "@/components/events/events-collapsible-filters";
import { EventsHint } from "@/components/events/events-hint";
import { EventsHistoryPanel } from "@/components/events/events-history-panel";
import { EventsKanbanBoard } from "@/components/events/events-kanban-board";
import { EventsPipelineTabs } from "@/components/events/events-pipeline-tabs";
import { EventsToolbar } from "@/components/events/events-toolbar";
import { getCustomerById } from "@/lib/customers/queries";
import {
  EVENT_HISTORY_PAGE_SIZE,
  EVENT_PHASE,
  EVENTS_PIPELINE_TAB,
  parseEventArchiveType,
  parseEventsPipelineTab,
} from "@/lib/events/constants";
import { getArchivedEvents, getEventStatuses, getEvents } from "@/lib/events/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type EventsPageProps = {
  searchParams: Promise<{
    tab?: string;
    customerId?: string;
    from?: string;
    to?: string;
    archiveType?: string;
    page?: string;
  }>;
};

const BOARD_HINT =
  "Usa el selector del card para cambiar de estado. Desliza a los lados para recorrer el tablero.";
const HISTORY_HINT =
  "Eventos archivados como Cerrado Ganado o Cerrado Perdido. Filtra por cliente, fechas y tipo.";

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const {
    tab: tabParam,
    customerId,
    from,
    to,
    archiveType: archiveTypeParam,
    page: pageParam,
  } = await searchParams;

  const tab = parseEventsPipelineTab(tabParam);
  const archiveType = parseEventArchiveType(archiveTypeParam);
  const page = Math.max(1, Number(pageParam) || 1);
  const isHistory = tab === EVENTS_PIPELINE_TAB.HISTORY;
  const hasActiveFilters = Boolean(
    customerId || (isHistory && (from || to || archiveType)),
  );

  const [statuses, events, archived, defaultCustomer] = await Promise.all([
    getEventStatuses(),
    isHistory
      ? Promise.resolve([])
      : getEvents({
          customerId,
          phases: [EVENT_PHASE.COMMERCIAL, EVENT_PHASE.OPERATIONAL],
        }),
    isHistory
      ? getArchivedEvents({
          customerId,
          dateFrom: from,
          dateTo: to,
          archiveType,
          page,
          pageSize: EVENT_HISTORY_PAGE_SIZE,
        })
      : Promise.resolve({
          events: [],
          total: 0,
          page: 1,
          pageSize: EVENT_HISTORY_PAGE_SIZE,
        }),
    customerId ? getCustomerById(customerId) : Promise.resolve(null),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(archived.total / EVENT_HISTORY_PAGE_SIZE),
  );

  return (
    <main
      className={cn(
        "mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-6",
        isHistory ? "gap-6 py-8" : "min-h-0 gap-3 overflow-hidden py-4",
      )}
    >
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="inline-flex items-center gap-1.5 text-2xl font-semibold tracking-tight">
          <CalendarDays className="size-6 text-muted-foreground" />
          Eventos
          <EventsHint
            description={isHistory ? HISTORY_HINT : BOARD_HINT}
          />
        </h1>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/events/settings/accounts"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "inline-flex items-center gap-1.5",
            )}
          >
            <Landmark className="size-4" />
            Cuentas
          </Link>
          <Link
            href="/events/settings/sources"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "inline-flex items-center gap-1.5",
            )}
          >
            <Settings2 className="size-4" />
            Fuentes
          </Link>
          <Link
            href="/events/new"
            className={cn(
              buttonVariants({ variant: "add", size: "sm" }),
              "inline-flex items-center gap-1.5",
            )}
          >
            <Plus className="size-4" />
            Nuevo evento
          </Link>
        </div>
      </div>

      {isHistory ? (
        <Suspense fallback={<div className="h-8 rounded-md bg-muted" />}>
          <EventsHistoryPanel
            events={archived.events}
            total={archived.total}
            page={page}
            totalPages={totalPages}
            customerId={customerId}
            defaultCustomer={defaultCustomer}
            dateFrom={from}
            dateTo={to}
            archiveType={archiveType}
            tabs={
              <EventsPipelineTabs activeTab={tab} customerId={customerId} />
            }
            hasActiveFilters={hasActiveFilters}
          />
        </Suspense>
      ) : (
        <>
          <EventsCollapsibleFilters
            hasActiveFilters={hasActiveFilters}
            toolbar={
              <EventsPipelineTabs activeTab={tab} customerId={customerId} />
            }
          >
            <Suspense fallback={<div className="h-20 rounded-xl bg-muted" />}>
              <EventsToolbar
                customerId={customerId}
                defaultCustomer={defaultCustomer}
              />
            </Suspense>
          </EventsCollapsibleFilters>
          <EventsKanbanBoard
            statuses={statuses}
            events={events}
            pipelineTab={tab}
          />
        </>
      )}
    </main>
  );
}
