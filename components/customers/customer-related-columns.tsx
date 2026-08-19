import Link from "next/link";
import { getLinkedQuote } from "@/lib/events/event-badges";
import { formatEventDate } from "@/lib/events/format-dates";
import { formatCurrency } from "@/lib/quotes/format";
import type { EventWithRelations, QuoteWithRelations } from "@/lib/supabase/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CustomerRelatedColumnsProps = {
  events: EventWithRelations[];
  quotes: QuoteWithRelations[];
};

function EventRow({ event }: { event: EventWithRelations }) {
  const linkedQuote = getLinkedQuote(event);
  const eventDate = formatEventDate(event.event_date);

  return (
    <li className="rounded-lg border p-4">
      <Link
        href={`/events/${event.id}`}
        className="font-medium hover:underline"
      >
        {event.title}
      </Link>
      <p className="mt-1 text-sm text-muted-foreground">{event.event_statuses.name}</p>
      {eventDate && (
        <p className="mt-1 text-sm text-muted-foreground">{eventDate}</p>
      )}
      {linkedQuote && (
        <p className="mt-2 text-sm font-semibold">
          {formatCurrency(Number(linkedQuote.total))}
        </p>
      )}
    </li>
  );
}

function QuoteRow({ quote }: { quote: QuoteWithRelations }) {
  return (
    <li className="rounded-lg border p-4">
      <Link
        href={`/quotes/${quote.id}/edit`}
        className="font-medium hover:underline"
      >
        Cotización #{quote.quote_number}
      </Link>
      <p className="mt-1 text-sm text-muted-foreground">{quote.quote_statuses.name}</p>
      <p className="mt-1 text-sm font-semibold">
        {formatCurrency(Number(quote.total))}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {new Date(quote.created_at).toLocaleDateString("es-CR")}
      </p>
    </li>
  );
}

export function CustomerRelatedColumns({
  events,
  quotes,
}: CustomerRelatedColumnsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Eventos ({events.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Este cliente no tiene eventos.</p>
          ) : (
            <ul className="space-y-3">
              {events.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cotizaciones sueltas ({quotes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay cotizaciones sueltas. Las vinculadas a eventos aparecen en la
              columna de eventos.
            </p>
          ) : (
            <ul className="space-y-3">
              {quotes.map((quote) => (
                <QuoteRow key={quote.id} quote={quote} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
