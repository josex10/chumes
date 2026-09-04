import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Pencil, Phone, UserRound } from "lucide-react";
import { getCustomerTypes } from "@/lib/customers/queries";
import {
  formatPhoneNumber,
  resolveCustomerPhone,
} from "@/lib/customers/phone";
import { EventCustomerName } from "@/components/events/event-customer-name";
import { getEventById, getEventStatuses } from "@/lib/events/queries";
import { getLinkableQuotesForCustomer } from "@/lib/quotes/queries";
import { getEventPaymentData } from "@/lib/payments/queries";
import { canTransitionStatus, getStatusPhase, withLostArchiveAtEnd } from "@/lib/events/status-transitions";
import { EVENT_PHASE, EVENT_STATUS, EVENTS_PIPELINE_TAB } from "@/lib/events/constants";
import { buildEventsHref } from "@/lib/events/events-url";
import { EventFollowUpsCard } from "@/components/follow-ups/event-follow-ups-card";
import { getEventFollowUps, getFollowUpTemplates } from "@/lib/follow-ups/queries";
import { getFollowUpProgress } from "@/lib/follow-ups/schedule";
import { EventQuotePanel } from "@/components/events/event-quote-panel";
import { EventPaymentsPanel } from "@/components/events/event-payments-panel";
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
  currentStatusCode: string,
  currentPhase: string,
  allStatuses: EventStatus[],
): EventStatus[] {
  const pipelineStatuses = allStatuses.filter(
    (status) =>
      status.code === currentStatusCode || status.phase === currentPhase,
  );
  const extraArchives =
    currentPhase === EVENT_PHASE.OPERATIONAL &&
    canTransitionStatus(currentStatusCode, EVENT_STATUS.WON_ARCHIVED)
      ? [EVENT_STATUS.WON_ARCHIVED]
      : [];

  return withLostArchiveAtEnd(pipelineStatuses, allStatuses, extraArchives);
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const [event, allStatuses, customerTypes, followUps, templates] =
    await Promise.all([
      getEventById(id),
      getEventStatuses(),
      getCustomerTypes(),
      getEventFollowUps(id),
      getFollowUpTemplates(true),
    ]);

  if (!event) {
    notFound();
  }

  const phase = getStatusPhase(event.event_statuses.code);
  const isCommercial = phase === EVENT_PHASE.COMMERCIAL;
  const followUpProgress = getFollowUpProgress(
    event.created_at,
    followUps.map((item) => ({
      step: item.step,
      completed_at: item.completed_at,
    })),
    event.follow_up_paused_at,
  );
  const [linkableQuotes, paymentData] = await Promise.all([
    isCommercial
      ? getLinkableQuotesForCustomer(event.customer_id)
      : Promise.resolve([]),
    getEventPaymentData(id),
  ]);
  const phone = resolveCustomerPhone(
    event.customer_contacts?.phone,
    event.customers.phone,
  );
  const formattedPhone = phone ? formatPhoneNumber(phone) : null;
  const selectableStatuses = getSelectableStatuses(
    event.event_statuses.code,
    event.event_statuses.phase,
    allStatuses,
  );
  const backHref =
    phase === EVENT_PHASE.TERMINAL
      ? buildEventsHref({ tab: EVENTS_PIPELINE_TAB.HISTORY })
      : "/events";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={backHref}
            className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {phase === EVENT_PHASE.TERMINAL
              ? "Volver al historial"
              : "Volver al tablero"}
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {event.title}
          </h1>
        </div>
        {phase === EVENT_PHASE.COMMERCIAL && (
          <Link
            href={`/events/${event.id}/edit`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "inline-flex items-center gap-1.5",
            )}
          >
            <Pencil className="size-4" />
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
              <div className="min-w-0 space-y-1">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <UserRound className="size-3.5" />
                  Cliente
                </p>
                <EventCustomerName
                  customer={event.customers}
                  customerTypes={customerTypes}
                  className="font-medium text-foreground"
                />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5" />
                  Teléfono
                </p>
                {formattedPhone && phone ? (
                  <a
                    href={`tel:${phone.replace(/\D/g, "")}`}
                    className="block font-medium tabular-nums hover:underline"
                  >
                    {formattedPhone}
                  </a>
                ) : (
                  <p className="font-medium">—</p>
                )}
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-sm text-muted-foreground">Fuente</p>
                <p
                  className={
                    event.event_sources.code === "WEBSITE"
                      ? "font-medium text-sky-700 dark:text-sky-300"
                      : "font-medium"
                  }
                >
                  {event.event_sources.name}
                  {event.event_sources.code === "WEBSITE" ? " · lead del sitio" : ""}
                </p>
              </div>
              <div className="min-w-0 space-y-1">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  Ubicación
                </p>
                <p className="font-medium">{event.estimated_location ?? "—"}</p>
              </div>
              {event.notes && (
                <div className="min-w-0 space-y-1 sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="font-medium whitespace-pre-wrap">{event.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <EventScheduleCard
            eventId={event.id}
            eventDate={event.event_date}
            deliveryDate={event.delivery_date}
            pickupDate={event.pickup_date}
            canEdit={phase !== EVENT_PHASE.TERMINAL}
          />

          <EventFollowUpsCard
            event={event}
            followUps={followUps}
            templates={templates}
            progress={followUpProgress}
            isCommercial={isCommercial}
          />

          <EventQuotePanel
            event={event}
            isCommercial={isCommercial}
            isOperational={phase === EVENT_PHASE.OPERATIONAL}
            linkableQuotes={linkableQuotes}
          />

          {paymentData.summary ? (
            <EventPaymentsPanel
              eventId={event.id}
              eventPhase={event.event_statuses.phase}
              eventStatusCode={event.event_statuses.code}
              summary={paymentData.summary}
              movements={paymentData.movements}
              paymentMethods={paymentData.paymentMethods}
              bankAccounts={paymentData.bankAccounts}
            />
          ) : null}
        </div>

        <EventStatusActions event={event} selectableStatuses={selectableStatuses} />
      </div>
    </main>
  );
}
