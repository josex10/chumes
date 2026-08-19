import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById, getEventStatuses } from "@/lib/events/queries";
import { getLinkableQuotesForCustomer } from "@/lib/quotes/queries";
import { getStatusPhase } from "@/lib/events/status-transitions";
import { EVENT_PHASE, EVENT_STATUS } from "@/lib/events/constants";
import { EventQuotePanel } from "@/components/events/event-quote-panel";
import { EventScheduleCard } from "@/components/events/event-schedule-card";
import { EventStatusActions } from "@/components/events/event-status-actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EventStatus } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
};

function getSelectableStatuses(
  phase: ReturnType<typeof getStatusPhase>,
  allStatuses: EventStatus[],
): EventStatus[] {
  if (phase === EVENT_PHASE.COMMERCIAL) {
    return allStatuses.filter(
      (status) =>
        status.phase === EVENT_PHASE.COMMERCIAL || status.code === EVENT_STATUS.LOST,
    );
  }

  if (phase === EVENT_PHASE.OPERATIONAL) {
    return allStatuses.filter(
      (status) =>
        status.phase === EVENT_PHASE.OPERATIONAL ||
        status.code === EVENT_STATUS.COMPLETED ||
        status.code === EVENT_STATUS.CANCELLED,
    );
  }

  return [];
}

function getCustomerPhone(event: NonNullable<Awaited<ReturnType<typeof getEventById>>>) {
  return event.customer_contacts?.phone ?? event.customers.phone ?? null;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const [event, allStatuses] = await Promise.all([
    getEventById(id),
    getEventStatuses(),
  ]);

  if (!event) {
    notFound();
  }

  const phase = getStatusPhase(event.event_statuses.code);
  const isCommercial = phase === EVENT_PHASE.COMMERCIAL;
  const linkableQuotes = isCommercial
    ? await getLinkableQuotesForCustomer(event.customer_id)
    : [];
  const phone = getCustomerPhone(event);
  const selectableStatuses = getSelectableStatuses(phase, allStatuses);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/events"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Volver al tablero
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {event.title}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {event.customers.name} · {event.event_statuses.name}
          </p>
          {phone && (
            <p className="mt-1">
              <a
                href={`tel:${phone.replace(/\D/g, "")}`}
                className="text-lg font-semibold tracking-tight hover:underline"
              >
                {phone}
              </a>
            </p>
          )}
        </div>
        {phase === EVENT_PHASE.COMMERCIAL && (
          <Link
            href={`/events/${event.id}/edit`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Editar
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{event.customers.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                {phone ? (
                  <a
                    href={`tel:${phone.replace(/\D/g, "")}`}
                    className="font-medium hover:underline"
                  >
                    {phone}
                  </a>
                ) : (
                  <p className="font-medium">—</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fuente</p>
                <p className="font-medium">{event.event_sources.name}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Ubicación</p>
                <p className="font-medium">{event.estimated_location ?? "—"}</p>
              </div>
              {event.notes && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="font-medium">{event.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <EventScheduleCard
            eventDate={event.event_date}
            deliveryDate={event.delivery_date}
            pickupDate={event.pickup_date}
          />

          <EventQuotePanel
            event={event}
            isCommercial={isCommercial}
            isOperational={phase === EVENT_PHASE.OPERATIONAL}
            linkableQuotes={linkableQuotes}
          />
        </div>

        <EventStatusActions event={event} selectableStatuses={selectableStatuses} />
      </div>
    </main>
  );
}
