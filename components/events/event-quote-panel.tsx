"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { unlinkQuoteFromEvent } from "@/lib/events/actions";
import { getLinkedQuote } from "@/lib/events/event-badges";
import type { EventWithRelations, QuoteWithRelations } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/quotes/format";
import { QuoteDownloadButton } from "@/components/quotes/quote-download-button";
import { ReservationDownloadButton } from "@/components/events/reservation-download-button";
import { EventLinkQuoteDialog } from "@/components/events/event-link-quote-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EventQuotePanelProps = {
  event: EventWithRelations;
  isCommercial: boolean;
  isOperational: boolean;
  linkableQuotes: QuoteWithRelations[];
};

export function EventQuotePanel({
  event,
  isCommercial,
  isOperational,
  linkableQuotes,
}: EventQuotePanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const linkedQuote = getLinkedQuote(event);

  function handleUnlink() {
    if (!linkedQuote) return;
    if (!confirm("¿Desvincular esta cotización del evento?")) return;

    setError(null);
    startTransition(async () => {
      const result = await unlinkQuoteFromEvent(linkedQuote.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cotización</CardTitle>
        <CardDescription>
          Obligatoria para confirmar y reservar inventario. Máximo una por evento.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!linkedQuote ? (
          <>
            <p className="text-sm text-muted-foreground">
              Este evento aún no tiene cotización vinculada.
            </p>
            {isCommercial && (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/quotes/new?eventId=${event.id}&customerId=${event.customer_id}`}
                  className={cn(buttonVariants({ variant: "add" }), "inline-flex")}
                >
                  Crear cotización
                </Link>
                <EventLinkQuoteDialog
                  eventId={event.id}
                  quotes={linkableQuotes}
                />
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Número</p>
              <p className="font-medium">{linkedQuote.quote_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <p className="font-medium">
                {linkedQuote.quote_statuses?.name ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-semibold">
                {formatCurrency(Number(linkedQuote.total))}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/quotes/${linkedQuote.id}/edit`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Ver cotización
              </Link>
              {isOperational ? (
                <ReservationDownloadButton eventId={event.id} />
              ) : (
                <QuoteDownloadButton
                  quoteId={linkedQuote.id}
                  label="PDF cotización"
                  variant="ghost"
                  size="sm"
                />
              )}
              {isCommercial && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handleUnlink}
                >
                  Desvincular
                </Button>
              )}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
