"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { PackingList } from "@/components/logistics/packing-list";
import { PlannerEventDrawer } from "@/components/planner/planner-event-drawer";
import { Button } from "@/components/ui/button";
import {
  formatPackingQuantity,
  packingListHasShortage,
  type PackingListLine,
} from "@/lib/logistics/packing-list";
import {
  PLANNER_WEEKDAYS,
  buildPlannerHref,
  getPlannerMonthGrid,
  shiftPlannerMonth,
} from "@/lib/planner/calendar";
import {
  formatPlannerDayLabel,
  formatPlannerDeliveryTime,
  formatPlannerMonthLabel,
} from "@/lib/planner/format";
import { summarizePackingLists } from "@/lib/planner/summary";
import type { PlannerEvent } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

const VISIBLE_CHIPS = 2;

type PlannerBoardProps = {
  events: PlannerEvent[];
  month: string;
  day: string;
  todayKey: string;
};

function packingPreview(lines: PackingListLine[]): string | null {
  if (lines.length === 0) return null;

  const preview = lines
    .slice(0, 2)
    .map((line) => `${formatPackingQuantity(line.quantity)} × ${line.name}`)
    .join(" · ");
  const remaining = lines.length - 2;
  return remaining > 0 ? `${preview} · +${remaining}` : preview;
}

function eventMeta(event: PlannerEvent): string {
  return [
    formatPlannerDeliveryTime(event.deliveryDate),
    event.customerName !== event.title ? event.customerName : null,
    event.location,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function PlannerBoard({
  events,
  month,
  day,
  todayKey,
}: PlannerBoardProps) {
  const router = useRouter();
  const [drawerEvent, setDrawerEvent] = useState<PlannerEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const grid = useMemo(() => getPlannerMonthGrid(month), [month]);
  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, PlannerEvent[]>();
    for (const event of events) {
      const current = grouped.get(event.eventDate) ?? [];
      current.push(event);
      grouped.set(event.eventDate, current);
    }
    return grouped;
  }, [events]);

  const dayEvents = eventsByDay.get(day) ?? [];
  const summary = useMemo(
    () => summarizePackingLists(dayEvents.map((event) => event.packingList)),
    [dayEvents],
  );
  const summaryShort = summary.some((line) => line.short);
  const weeks: Array<typeof grid.days> = [];
  for (let index = 0; index < grid.days.length; index += 7) {
    weeks.push(grid.days.slice(index, index + 7));
  }

  function navigate(nextMonth: string, nextDay: string) {
    setDrawerOpen(false);
    router.push(buildPlannerHref(nextMonth, nextDay), { scroll: false });
  }

  function openDay(dateKey: string, inMonth: boolean) {
    const nextMonth = inMonth ? month : dateKey.slice(0, 7);
    navigate(nextMonth, dateKey);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      document.getElementById("planner-day")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function openEvent(event: PlannerEvent) {
    setDrawerEvent(event);
    setDrawerOpen(true);
    const eventMonth = event.eventDate.slice(0, 7);
    const nextMonth = eventMonth === month ? month : eventMonth;
    if (event.eventDate !== day || nextMonth !== month) {
      router.push(buildPlannerHref(nextMonth, event.eventDate), { scroll: false });
    }
  }

  const showingToday = month === todayKey.slice(0, 7) && day === todayKey;

  return (
    <>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium">{formatPlannerMonthLabel(month)}</h2>
            <div className="flex items-center gap-1">
              {!showingToday ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(todayKey.slice(0, 7), todayKey)}
                >
                  Hoy
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Mes anterior"
                onClick={() => {
                  const next = shiftPlannerMonth(month, day, -1);
                  navigate(next.month, next.day);
                }}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Mes siguiente"
                onClick={() => {
                  const next = shiftPlannerMonth(month, day, 1);
                  navigate(next.month, next.day);
                }}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
            <div
              className="grid grid-cols-7 bg-muted/40"
              role="row"
            >
              {PLANNER_WEEKDAYS.map((label) => (
                <div
                  key={label}
                  role="columnheader"
                  className="px-1 py-2 text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
                >
                  {label}
                </div>
              ))}
            </div>
            <div role="grid" aria-label={formatPlannerMonthLabel(month)}>
              {weeks.map((week) => (
                <div
                  key={week[0]?.dateKey}
                  role="row"
                  className="grid grid-cols-7"
                >
                  {week.map((cell, index) => {
                    const cellEvents = eventsByDay.get(cell.dateKey) ?? [];
                    const extra = Math.max(cellEvents.length - VISIBLE_CHIPS, 0);
                    const selected = cell.dateKey === day;
                    const isToday = cell.dateKey === todayKey;
                    const dayNumber = Number(cell.dateKey.slice(8, 10));

                    return (
                      <div
                        key={cell.dateKey}
                        role="gridcell"
                        aria-selected={selected}
                        onClick={() => openDay(cell.dateKey, cell.inMonth)}
                        className={cn(
                          "flex min-h-16 cursor-pointer flex-col gap-1 border-t border-border/60 p-1 md:min-h-28 md:p-1.5",
                          index < 6 && "border-r border-border/60",
                          selected && "bg-muted/50",
                          !cell.inMonth && "bg-muted/20",
                        )}
                      >
                        <button
                          type="button"
                          onClick={(click) => {
                            click.stopPropagation();
                            openDay(cell.dateKey, cell.inMonth);
                          }}
                          aria-current={isToday ? "date" : undefined}
                          aria-label={`${formatPlannerDayLabel(cell.dateKey)}, ${cellEvents.length} eventos`}
                          className="flex items-center justify-between gap-1 rounded-md px-0.5 text-left hover:bg-muted/60"
                        >
                          <span
                            className={cn(
                              "inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
                              isToday && "bg-foreground font-medium text-background",
                              !isToday && cell.inMonth && "text-foreground",
                              !isToday && !cell.inMonth && "text-muted-foreground",
                              selected && !isToday && "font-semibold",
                            )}
                          >
                            {dayNumber}
                          </span>
                          {cellEvents.length > 0 ? (
                            <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium tabular-nums text-muted-foreground md:hidden">
                              {cellEvents.length}
                            </span>
                          ) : null}
                        </button>

                        <div className="hidden min-w-0 flex-col gap-0.5 md:flex">
                          {cellEvents.slice(0, VISIBLE_CHIPS).map((event) => {
                            const active = drawerOpen && drawerEvent?.id === event.id;
                            return (
                              <button
                                key={event.id}
                                type="button"
                                onClick={(click) => {
                                  click.stopPropagation();
                                  openEvent(event);
                                }}
                                className={cn(
                                  "truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium",
                                  active
                                    ? "bg-foreground text-background"
                                    : "bg-muted text-foreground hover:bg-muted/70",
                                )}
                              >
                                {event.customerName}
                              </button>
                            );
                          })}
                          {extra > 0 ? (
                            <button
                              type="button"
                              onClick={(click) => {
                                click.stopPropagation();
                                openDay(cell.dateKey, cell.inMonth);
                              }}
                              className="px-1.5 text-left text-[11px] text-muted-foreground hover:text-foreground"
                            >
                              +{extra}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside
          id="planner-day"
          className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 lg:sticky lg:top-0 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-medium">{formatPlannerDayLabel(day)}</h2>
            <p className="text-sm text-muted-foreground">
              {dayEvents.length === 0
                ? "Sin eventos reservados"
                : dayEvents.length === 1
                  ? "1 evento reservado"
                  : `${dayEvents.length} eventos reservados`}
            </p>
          </div>

          {dayEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay eventos reservados este día.
            </p>
          ) : (
            <>
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Comprometido este día
                </h3>
                {summary.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Estos eventos no tienen productos en la cotización.
                  </p>
                ) : (
                  <>
                    {summaryShort ? (
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        La suma de este día supera el stock de algunos productos.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        La suma cabe en el stock actual.
                      </p>
                    )}
                    <PackingList lines={summary} showStock />
                  </>
                )}
              </section>

              <ul className="flex flex-col gap-2">
                {dayEvents.map((event) => {
                  const preview = packingPreview(event.packingList);
                  const meta = eventMeta(event);
                  const active = drawerOpen && drawerEvent?.id === event.id;
                  const short = packingListHasShortage(event.packingList);

                  return (
                    <li key={event.id}>
                      <button
                        type="button"
                        onClick={() => openEvent(event)}
                        className={cn(
                          "flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left ring-1 ring-foreground/10 transition-colors hover:bg-muted/40",
                          active && "bg-muted/50",
                        )}
                      >
                        <span className="flex items-start justify-between gap-2">
                          <span className="font-medium">{event.title}</span>
                          <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                            {short ? (
                              <AlertTriangle className="size-3.5 text-amber-700 dark:text-amber-300" />
                            ) : null}
                            {event.statusName}
                          </span>
                        </span>
                        {meta ? (
                          <span className="text-xs text-muted-foreground">{meta}</span>
                        ) : null}
                        {preview ? (
                          <span className="text-xs text-foreground/80">{preview}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Sin productos en la cotización
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </aside>
      </div>

      <PlannerEventDrawer
        event={drawerEvent}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
