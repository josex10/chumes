"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Link2 } from "lucide-react";
import { unlinkQuoteFromEvent } from "@/lib/events/actions";
import type { EventWithRelations } from "@/lib/supabase/types";
import { QuoteDownloadButton } from "@/components/quotes/quote-download-button";
import { QuoteLinkEventDialog } from "@/components/quotes/quote-link-event-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuotePageHeaderProps = {
  quoteId: string;
  quoteNumber: string;
  eventId?: string | null;
  canUnlink?: boolean;
  linkableEvents?: EventWithRelations[];
};

export function QuotePageHeader({
  quoteId,
  quoteNumber,
  eventId,
  canUnlink = false,
  linkableEvents = [],
}: QuotePageHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleUnlink() {
    if (!confirm("¿Desvincular esta cotización del evento?")) return;
    setError(null);
    startTransition(async () => {
      const result = await unlinkQuoteFromEvent(quoteId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Editar cotización</h1>
          <p className="mt-1 text-sm text-muted-foreground">Nº {quoteNumber}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <QuoteDownloadButton quoteId={quoteId} variant="outline" size="sm" />

          {eventId ? (
            <>
              <Link
                href={`/events/${eventId}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "inline-flex items-center gap-2",
                )}
              >
                <CalendarDays className="size-4" strokeWidth={1.5} />
                Ver evento
              </Link>
              {canUnlink && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={handleUnlink}
                >
                  Desvincular
                </Button>
              )}
            </>
          ) : (
            <QuoteLinkEventDialog
              quoteId={quoteId}
              events={linkableEvents}
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="inline-flex items-center gap-2"
                >
                  <Link2 className="size-4" strokeWidth={1.5} />
                  Vincular evento
                </Button>
              }
            />
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
