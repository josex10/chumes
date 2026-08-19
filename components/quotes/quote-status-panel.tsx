"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { unlinkQuoteFromEvent } from "@/lib/events/actions";
import { updateQuoteStatus } from "@/lib/quotes/actions";
import {
  getAllowedTransitions,
  getStatusActionLabel,
} from "@/lib/quotes/status-transitions";
import type {
  EventWithRelations,
  QuoteStatus,
} from "@/lib/supabase/types";
import { QuoteLinkEventDialog } from "@/components/quotes/quote-link-event-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type QuoteStatusPanelProps = {
  quoteId: string;
  currentStatus: QuoteStatus;
  eventId?: string | null;
  canUnlink?: boolean;
  linkableEvents?: EventWithRelations[];
};

export function QuoteStatusPanel({
  quoteId,
  currentStatus,
  eventId,
  canUnlink = false,
  linkableEvents = [],
}: QuoteStatusPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const transitions = getAllowedTransitions(currentStatus.code);

  function handleTransition(nextStatusCode: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateQuoteStatus(quoteId, nextStatusCode);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

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
    <Card>
      <CardHeader>
        <CardTitle>Status</CardTitle>
        <CardDescription>Manage quote lifecycle</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Current status</p>
          <p className="mt-1 font-medium">{currentStatus.name}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Evento</p>
          {eventId ? (
            <>
              <Link
                href={`/events/${eventId}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
              >
                Ver evento vinculado
              </Link>
              {canUnlink && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isPending}
                  onClick={handleUnlink}
                >
                  Desvincular del evento
                </Button>
              )}
            </>
          ) : (
            <QuoteLinkEventDialog quoteId={quoteId} events={linkableEvents} />
          )}
        </div>

        {transitions.length > 0 && (
          <div className="flex flex-col gap-2">
            {transitions.map((statusCode) => (
              <Button
                key={statusCode}
                type="button"
                variant="commit"
                disabled={isPending}
                onClick={() => handleTransition(statusCode)}
              >
                {getStatusActionLabel(statusCode)}
              </Button>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
