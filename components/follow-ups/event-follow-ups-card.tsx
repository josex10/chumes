"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle } from "lucide-react";
import { SendFollowUpDialog } from "@/components/follow-ups/send-follow-up-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  pauseEventFollowUp,
  resumeEventFollowUp,
} from "@/lib/follow-ups/actions";
import { getFollowUpStepLabel } from "@/lib/follow-ups/constants";
import { formatDateKey, toCostaRicaDateKey } from "@/lib/follow-ups/calendar";
import type { FollowUpProgress } from "@/lib/follow-ups/schedule";
import type {
  EventFollowUpWithRelations,
  EventWithRelations,
  FollowUpTemplate,
} from "@/lib/supabase/types";
import { getLinkedQuote } from "@/lib/events/event-badges";
import { resolveCustomerPhone } from "@/lib/customers/phone";

type EventFollowUpsCardProps = {
  event: EventWithRelations;
  followUps: EventFollowUpWithRelations[];
  templates: FollowUpTemplate[];
  progress: FollowUpProgress;
  isCommercial: boolean;
};

export function EventFollowUpsCard({
  event,
  followUps,
  templates,
  progress,
  isCommercial,
}: EventFollowUpsCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const quoteTotal = getLinkedQuote(event)?.total ?? null;
  const phone = resolveCustomerPhone(
    event.customer_contacts?.phone,
    event.customers.phone,
  );
  const canSend =
    isCommercial && progress.kind === "pending" && Boolean(phone);

  const context = useMemo(() => {
    if (progress.kind !== "pending") return null;
    return {
      eventId: event.id,
      step: progress.step,
      customerName: event.customers.name,
      eventTitle: event.title,
      eventDate: event.event_date,
      location: event.estimated_location,
      quoteTotal,
      phone,
    };
  }, [event, phone, progress, quoteTotal]);

  function handlePauseOrResume() {
    setError(null);
    startTransition(async () => {
      const result =
        progress.kind === "paused"
          ? await resumeEventFollowUp(event.id)
          : await pauseEventFollowUp(event.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <CardTitle>Seguimientos</CardTitle>
        {isCommercial ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={handlePauseOrResume}
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : null}
              {progress.kind === "paused"
                ? "Reanudar"
                : "Cliente respondió"}
            </Button>
            {canSend && context ? (
              <Button
                type="button"
                size="sm"
                className="inline-flex items-center gap-1.5"
                onClick={() => setOpen(true)}
              >
                <MessageCircle className="size-3.5" />
                WhatsApp
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {progress.kind === "paused" ? (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-300">
            Seguimiento pausado porque el cliente respondió.
          </p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {followUps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no se ha enviado ningún seguimiento a este cliente.
          </p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paso</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Plantilla</TableHead>
                  <TableHead>Mensaje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {followUps.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {getFollowUpStepLabel(item.step)}
                    </TableCell>
                    <TableCell>
                      {formatDateKey(toCostaRicaDateKey(item.completed_at))}
                    </TableCell>
                    <TableCell>
                      {item.follow_up_templates?.name ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-pre-wrap text-muted-foreground">
                      {item.message_body ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {context ? (
        <SendFollowUpDialog
          open={open}
          onOpenChange={setOpen}
          context={context}
          templates={templates}
        />
      ) : null}
    </Card>
  );
}
