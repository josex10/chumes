import {
  addCalendarDays,
  COSTA_RICA_TIMEZONE,
  formatWeekEventDateLabel,
  getCostaRicaWeekBounds,
  toCostaRicaDateKey,
  todayInCostaRica,
} from "@/lib/follow-ups/calendar";
import {
  LOGISTICS_WINDOW,
  type LogisticsWindow,
} from "@/lib/logistics/constants";
import type { LogisticsDayGroup, LogisticsQueueItem } from "@/lib/logistics/types";

export function getLogisticsWindowBounds(
  window: LogisticsWindow,
  todayKey = todayInCostaRica(),
): { startKey: string; endKey: string } {
  if (window === LOGISTICS_WINDOW.TODAY) {
    return { startKey: todayKey, endKey: todayKey };
  }

  if (window === LOGISTICS_WINDOW.WEEK) {
    return getCostaRicaWeekBounds(todayKey);
  }

  const thisWeek = getCostaRicaWeekBounds(todayKey);
  const startKey = addCalendarDays(thisWeek.endKey, 1);
  return { startKey, endKey: addCalendarDays(startKey, 6) };
}

export function isInLogisticsWindow(
  dateKey: string | null,
  window: LogisticsWindow,
  todayKey = todayInCostaRica(),
): boolean {
  if (!dateKey) return true;
  if (dateKey < todayKey) return true;

  const { startKey, endKey } = getLogisticsWindowBounds(window, todayKey);
  return dateKey >= startKey && dateKey <= endKey;
}

export function toLogisticsDateKey(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  return toCostaRicaDateKey(value);
}

export function formatLogisticsDayLabel(
  dateKey: string,
  todayKey = todayInCostaRica(),
): string {
  const relative = formatWeekEventDateLabel(dateKey, todayKey);
  const [year, month, day] = dateKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString(
    "es-CR",
    {
      timeZone: "UTC",
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  );

  if (relative === "Hoy" || relative === "Mañana" || relative === "Ayer") {
    return `${relative} · ${weekday}`;
  }

  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

export function formatLogisticsTime(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("es-CR", {
    timeZone: COSTA_RICA_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function groupLogisticsItemsByDay(
  items: LogisticsQueueItem[],
  todayKey = todayInCostaRica(),
): LogisticsDayGroup[] {
  const undated: LogisticsQueueItem[] = [];
  const byDate = new Map<string, LogisticsQueueItem[]>();

  for (const item of items) {
    if (!item.dateKey) {
      undated.push(item);
      continue;
    }
    const list = byDate.get(item.dateKey) ?? [];
    list.push(item);
    byDate.set(item.dateKey, list);
  }

  const groups: LogisticsDayGroup[] = [];

  if (undated.length > 0) {
    groups.push({
      dateKey: null,
      label: "Sin fecha",
      items: sortByTime(undated),
    });
  }

  for (const dateKey of [...byDate.keys()].sort()) {
    groups.push({
      dateKey,
      label: formatLogisticsDayLabel(dateKey, todayKey),
      items: sortByTime(byDate.get(dateKey) ?? []),
    });
  }

  return groups;
}

function sortByTime(items: LogisticsQueueItem[]): LogisticsQueueItem[] {
  return [...items].sort((a, b) => {
    if (a.sortAt && b.sortAt) return a.sortAt.localeCompare(b.sortAt);
    if (a.sortAt) return -1;
    if (b.sortAt) return 1;
    return a.event.title.localeCompare(b.event.title, "es");
  });
}
