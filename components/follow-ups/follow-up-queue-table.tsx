"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Check,
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
  TableFooter,
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
import { formatCurrency } from "@/lib/quotes/format";
import type { FollowUpTemplate } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const THIS_WEEK_PILL =
  "inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-300";

const CONTACTED_PILL =
  "inline-flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-800 dark:text-sky-300";

const CADENCE_PILL =
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground";

const BUCKET_META = {
  [FOLLOW_UP_BUCKET.CLOSE_THIS_WEEK]: {
    title: "Cerrar esta semana",
    description:
      "Eventos comerciales con fecha esta semana. Prioridad de cierre.",
    icon: CalendarClock,
    accent:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
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

function sumQuoteTotals(items: FollowUpQueueItem[]) {
  return items.reduce((sum, item) => sum + (item.quoteTotal ?? 0), 0);
}

function pendingLabel(count: number) {
  return count === 1 ? "1 pendiente" : `${count} pendientes`;
}

function FollowUpAmount({
  amount,
  className,
}: {
  amount: number | null;
  className?: string;
}) {
  if (amount == null || !Number.isFinite(amount)) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        Sin cotización
      </span>
    );
  }

  return (
    <span className={cn("font-semibold tabular-nums tracking-tight", className)}>
      {formatCurrency(amount)}
    </span>
  );
}

function toMessageContext(
  item: FollowUpQueueItem,
  adHoc: boolean,
): FollowUpMessageContext | null {
  if (!adHoc && !item.step) return null;
  return {
    eventId: item.event.id,
    step: adHoc ? null : item.step,
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
  const isCloseThisWeek = bucket === FOLLOW_UP_BUCKET.CLOSE_THIS_WEEK;
  const bucketTotal = sumQuoteTotals(items);
  const sendContext = sendItem
    ? toMessageContext(sendItem, isCloseThisWeek)
    : null;

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
              {items.length > 0 ? (
                <>
                  {" · "}
                  <span
                    className={cn("font-medium tabular-nums", meta.iconClass)}
                  >
                    {formatCurrency(bucketTotal)}
                  </span>
                </>
              ) : null}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {isCloseThisWeek
            ? "No hay eventos comerciales con fecha esta semana."
            : `No hay ${meta.title.toLowerCase()} pendientes para hoy.`}
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
                <TableHead>{isCloseThisWeek ? "Fecha" : "Vencimiento"}</TableHead>
                <TableHead className="text-right">Monto</TableHead>
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
                const isOverdue =
                  item.dueLabel.startsWith("Hace") || item.dueLabel === "Ayer";

                return (
                  <TableRow
                    key={item.event.id}
                    className={
                      isCloseThisWeek && item.contactedThisWeek
                        ? "opacity-60"
                        : undefined
                    }
                  >
                    <TableCell className="font-medium">
                      {item.event.customers.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          href={`/events/${item.event.id}`}
                          className="hover:underline"
                        >
                          {item.event.title}
                        </Link>
                        {item.isThisWeek && !isCloseThisWeek ? (
                          <span className={THIS_WEEK_PILL}>Esta semana</span>
                        ) : null}
                        {item.cadenceLabel ? (
                          <span className={CADENCE_PILL}>{item.cadenceLabel}</span>
                        ) : null}
                        {isCloseThisWeek && item.contactedThisWeek ? (
                          <span className={CONTACTED_PILL}>
                            <Check className="size-3" />
                            Contactado
                          </span>
                        ) : null}
                      </div>
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
                          isOverdue
                            ? "text-rose-700 dark:text-rose-300"
                            : isCloseThisWeek && item.dueLabel === "Hoy"
                              ? "text-emerald-700 dark:text-emerald-300"
                              : "text-foreground",
                        )}
                      >
                        {item.dueLabel}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <FollowUpAmount amount={item.quoteTotal} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.step || isCloseThisWeek ? (
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
                        {isCloseThisWeek ? null : bucket !==
                          FOLLOW_UP_BUCKET.NO_RESPONSE ? (
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
            <TableFooter>
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-right text-muted-foreground"
                >
                  Total
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums tracking-tight">
                  {formatCurrency(bucketTotal)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
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

type FollowUpQueueTotals = {
  closeThisWeek: number;
  step1: number;
  step2: number;
  step3: number;
  noResponse: number;
};

export function FollowUpQueueSummary({
  counts,
  totals,
}: {
  counts: FollowUpQueueTotals;
  totals: FollowUpQueueTotals;
}) {
  const cards = [
    {
      bucket: FOLLOW_UP_BUCKET.CLOSE_THIS_WEEK,
      count: counts.closeThisWeek,
      total: totals.closeThisWeek,
    },
    {
      bucket: FOLLOW_UP_BUCKET.STEP_1,
      count: counts.step1,
      total: totals.step1,
    },
    {
      bucket: FOLLOW_UP_BUCKET.STEP_2,
      count: counts.step2,
      total: totals.step2,
    },
    {
      bucket: FOLLOW_UP_BUCKET.STEP_3,
      count: counts.step3,
      total: totals.step3,
    },
    {
      bucket: FOLLOW_UP_BUCKET.NO_RESPONSE,
      count: counts.noResponse,
      total: totals.noResponse,
    },
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map(({ bucket, count, total }) => {
        const meta = BUCKET_META[bucket];
        const Icon = meta.icon;
        return (
          <a
            key={bucket}
            href={`#seguimiento-${bucket.toLowerCase()}`}
            className="rounded-xl border bg-card p-4 transition hover:bg-muted/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{meta.title}</p>
                <p
                  className={cn(
                    "mt-1 text-xl font-semibold tracking-tight tabular-nums sm:text-2xl",
                    meta.iconClass,
                  )}
                >
                  {formatCurrency(total)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {pendingLabel(count)}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex size-10 shrink-0 items-center justify-center rounded-full border",
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
