"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  Eye,
  Flame,
  Loader2,
  MessageCircle,
  MessageCircleOff,
  TriangleAlert,
} from "lucide-react";
import { ArchiveLostDialog } from "@/components/events/archive-lost-dialog";
import { SendFollowUpDialog } from "@/components/follow-ups/send-follow-up-dialog";
import type { FollowUpMessageContext } from "@/components/follow-ups/send-follow-up-dialog";
import { getEventStatusVisual } from "@/components/events/event-status-style";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPhoneNumber } from "@/lib/customers/phone";
import {
  markEventLostFromFollowUp,
  pauseEventFollowUp,
} from "@/lib/follow-ups/actions";
import { FOLLOW_UP_BUCKET } from "@/lib/follow-ups/constants";
import type { FollowUpQueueItem } from "@/lib/follow-ups/types";
import type { FollowUpTemplate } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const BUCKET_META = {
  [FOLLOW_UP_BUCKET.STEP_1]: {
    title: "Primer seguimiento",
    description: "3 días después de creado el evento.",
    icon: CircleAlert,
    accent: "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
    iconClass: "text-amber-600 dark:text-amber-400",
  },
  [FOLLOW_UP_BUCKET.STEP_2]: {
    title: "Segundo seguimiento",
    description: "5 días después del primer contacto.",
    icon: TriangleAlert,
    accent: "border-orange-500/40 bg-orange-500/10 text-orange-800 dark:text-orange-300",
    iconClass: "text-orange-600 dark:text-orange-400",
  },
  [FOLLOW_UP_BUCKET.STEP_3]: {
    title: "Tercer seguimiento",
    description: "10 días después del segundo contacto.",
    icon: Flame,
    accent: "border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300",
    iconClass: "text-rose-600 dark:text-rose-400",
  },
  [FOLLOW_UP_BUCKET.NO_RESPONSE]: {
    title: "Sin respuesta",
    description: "3 días después del último seguimiento. Candidatos a perdido.",
    icon: MessageCircleOff,
    accent: "border-zinc-500/40 bg-zinc-500/10 text-zinc-800 dark:text-zinc-300",
    iconClass: "text-zinc-600 dark:text-zinc-400",
  },
} as const;

type FollowUpQueueTableProps = {
  items: FollowUpQueueItem[];
  bucket: FollowUpQueueItem["bucket"];
  templates: FollowUpTemplate[];
};

function toMessageContext(item: FollowUpQueueItem): FollowUpMessageContext | null {
  if (!item.step) return null;
  return {
    eventId: item.event.id,
    step: item.step,
    customerName: item.event.customers.name,
    eventTitle: item.event.title,
    eventDate: item.event.event_date,
    location: item.event.estimated_location,
    quoteTotal: item.quoteTotal,
    phone: item.phone,
  };
}

export function FollowUpQueueTable({
  items,
  bucket,
  templates,
}: FollowUpQueueTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sendItem, setSendItem] = useState<FollowUpQueueItem | null>(null);
  const [lostEventId, setLostEventId] = useState<string | null>(null);
  const meta = BUCKET_META[bucket];
  const Icon = meta.icon;
  const sendContext = sendItem ? toMessageContext(sendItem) : null;

  function handlePause(eventId: string) {
    setError(null);
    startTransition(async () => {
      const result = await pauseEventFollowUp(eventId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleLost() {
    if (!lostEventId) return;
    setError(null);
    startTransition(async () => {
      const result = await markEventLostFromFollowUp(lostEventId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setLostEventId(null);
      router.refresh();
    });
  }

  return (
    <section id={`seguimiento-${bucket.toLowerCase()}`} className="space-y-3">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-full border",
            meta.accent,
          )}
        >
          <Icon className={cn("size-4", meta.iconClass)} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {meta.title}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {items.length}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No hay {meta.title.toLowerCase()} pendientes para hoy.
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const visual = getEventStatusVisual(item.event.event_statuses.code);
                const StatusIcon = visual.icon;
                const formattedPhone = item.phone
                  ? formatPhoneNumber(item.phone)
                  : null;

                return (
                  <TableRow key={item.event.id}>
                    <TableCell className="font-medium">
                      {item.event.customers.name}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/events/${item.event.id}`}
                        className="hover:underline"
                      >
                        {item.event.title}
                      </Link>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formattedPhone ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
                          visual.pill,
                        )}
                      >
                        <StatusIcon className="size-3.5" />
                        {item.event.event_statuses.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          item.dueLabel.startsWith("Hace") ||
                            item.dueLabel === "Ayer"
                            ? "text-rose-700 dark:text-rose-300"
                            : "text-foreground",
                        )}
                      >
                        {item.dueLabel}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.step ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="inline-flex items-center gap-1.5"
                            disabled={isPending || !item.phone}
                            onClick={() => setSendItem(item)}
                          >
                            {isPending ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <MessageCircle className="size-3.5" />
                            )}
                            WhatsApp
                          </Button>
                        ) : null}
                        {bucket !== FOLLOW_UP_BUCKET.NO_RESPONSE ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={isPending}
                            onClick={() => handlePause(item.event.id)}
                          >
                            Respondió
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={isPending}
                            onClick={() => setLostEventId(item.event.id)}
                          >
                            Perdido
                          </Button>
                        )}
                        <Link
                          href={`/events/${item.event.id}`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "inline-flex items-center gap-1.5",
                          )}
                        >
                          <Eye className="size-3.5" />
                          Ver
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {sendContext ? (
        <SendFollowUpDialog
          open={Boolean(sendItem)}
          onOpenChange={(open) => {
            if (!open) setSendItem(null);
          }}
          context={sendContext}
          templates={templates}
        />
      ) : null}

      <ArchiveLostDialog
        open={Boolean(lostEventId)}
        onOpenChange={(open) => {
          if (!open) setLostEventId(null);
        }}
        pending={isPending}
        onConfirm={handleLost}
      />
    </section>
  );
}

export function FollowUpQueueSummary({
  counts,
}: {
  counts: {
    step1: number;
    step2: number;
    step3: number;
    noResponse: number;
  };
}) {
  const cards = [
    { bucket: FOLLOW_UP_BUCKET.STEP_1, count: counts.step1 },
    { bucket: FOLLOW_UP_BUCKET.STEP_2, count: counts.step2 },
    { bucket: FOLLOW_UP_BUCKET.STEP_3, count: counts.step3 },
    { bucket: FOLLOW_UP_BUCKET.NO_RESPONSE, count: counts.noResponse },
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ bucket, count }) => {
        const meta = BUCKET_META[bucket];
        const Icon = meta.icon;
        return (
          <a
            key={bucket}
            href={`#seguimiento-${bucket.toLowerCase()}`}
            className="rounded-xl border bg-card p-4 transition hover:bg-muted/40"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{meta.title}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {count}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex size-10 items-center justify-center rounded-full border",
                  meta.accent,
                )}
              >
                <Icon className={cn("size-4", meta.iconClass)} />
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
