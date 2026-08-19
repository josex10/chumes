import Link from "next/link";
import { Suspense } from "react";
import { EventsKanbanBoard } from "@/components/events/events-kanban-board";
import { EventsToolbar } from "@/components/events/events-toolbar";
import { getCustomerById } from "@/lib/customers/queries";
import { EVENT_PHASE } from "@/lib/events/constants";
import { getEventStatuses, getEvents } from "@/lib/events/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type EventsPageProps = {
  searchParams: Promise<{ customerId?: string }>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { customerId } = await searchParams;

  const [statuses, events, defaultCustomer] = await Promise.all([
    getEventStatuses(),
    getEvents(customerId ? { customerId } : {}),
    customerId ? getCustomerById(customerId) : Promise.resolve(null),
  ]);

  const activeEvents = events.filter(
    (event) => event.event_statuses.phase !== EVENT_PHASE.TERMINAL,
  );

  const emptyMessage = customerId
    ? "No hay eventos activos para este cliente."
    : "Aún no hay eventos activos.";

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Eventos</h1>
          <p className="mt-2 text-muted-foreground">
            Pipeline comercial flexible y operación estricta post-reserva.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/events/settings/sources"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Configuración de fuentes
          </Link>
          <Link href="/events/new" className={cn(buttonVariants({ variant: "add" }))}>
            Nuevo evento
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="h-8 max-w-md rounded-md bg-muted" />}>
        <EventsToolbar
          customerId={customerId}
          defaultCustomer={defaultCustomer}
        />
      </Suspense>

      {activeEvents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
          {!customerId && (
            <Link
              href="/events/new"
              className={cn(buttonVariants({ variant: "add" }), "mt-4 inline-flex")}
            >
              Crear primer evento
            </Link>
          )}
        </div>
      ) : (
        <EventsKanbanBoard statuses={statuses} events={activeEvents} />
      )}
    </main>
  );
}
