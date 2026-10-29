import { formatWeekRange } from "@/lib/dashboard/stats";
import {
  addCalendarDays,
  COSTA_RICA_OFFSET,
  getCostaRicaWeekBounds,
  toCostaRicaDateKey,
} from "@/lib/follow-ups/calendar";

export const DEMO_VIEW = {
  WEEK: "semana",
  MONTH: "mes",
} as const;

export type DemoView = (typeof DEMO_VIEW)[keyof typeof DEMO_VIEW];

export type DemoPeriod = {
  view: DemoView;
  anchorKey: string;
  startKey: string;
  endKey: string;
  label: string;
  isCurrent: boolean;
};

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function isDateKey(value: string | undefined): value is string {
  if (!value || !DATE_KEY.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function startOfCostaRicaDay(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00${COSTA_RICA_OFFSET}`);
}

export function endOfCostaRicaDay(dateKey: string): Date {
  return new Date(`${dateKey}T23:59:59.999${COSTA_RICA_OFFSET}`);
}

export function shiftMonthKey(monthStartKey: string, delta: number): string {
  const [year, month] = monthStartKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + delta, 1));
  const nextYear = shifted.getUTCFullYear();
  const nextMonth = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  return `${nextYear}-${nextMonth}-01`;
}

export function endOfMonthKey(monthStartKey: string): string {
  const [year, month] = monthStartKey.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${monthStartKey.slice(0, 7)}-${String(lastDay).padStart(2, "0")}`;
}

export function formatMonthLabel(monthStartKey: string): string {
  const [year, month, day] = monthStartKey.split("-").map(Number);
  const label = new Intl.DateTimeFormat("es-CR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function listDateKeys(startKey: string, endKey: string): string[] {
  const keys: string[] = [];
  let cursor = startKey;
  while (cursor <= endKey) {
    keys.push(cursor);
    cursor = addCalendarDays(cursor, 1);
  }
  return keys;
}

export function formatSeriesLabel(dateKey: string, view: DemoView): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (view === DEMO_VIEW.MONTH) return String(day);
  return new Intl.DateTimeFormat("es-CR", {
    weekday: "short",
    timeZone: "UTC",
  })
    .format(new Date(Date.UTC(year, month - 1, day, 12)))
    .replace(".", "");
}

export function parseDemoView(value: string | undefined): DemoView {
  return value === DEMO_VIEW.MONTH ? DEMO_VIEW.MONTH : DEMO_VIEW.WEEK;
}

export function resolveDemoPeriod(
  vista: string | undefined,
  fecha: string | undefined,
  now = new Date(),
): DemoPeriod {
  const view = parseDemoView(vista);
  const todayKey = toCostaRicaDateKey(now);
  const anchorInput = isDateKey(fecha) ? fecha : todayKey;

  if (view === DEMO_VIEW.MONTH) {
    const startKey = `${anchorInput.slice(0, 7)}-01`;
    const endKey = endOfMonthKey(startKey);
    const currentStart = `${todayKey.slice(0, 7)}-01`;
    return {
      view,
      anchorKey: startKey,
      startKey,
      endKey,
      label: formatMonthLabel(startKey),
      isCurrent: startKey === currentStart,
    };
  }

  const { startKey, endKey } = getCostaRicaWeekBounds(anchorInput);
  const current = getCostaRicaWeekBounds(todayKey);
  const start = new Date(`${startKey}T12:00:00${COSTA_RICA_OFFSET}`);
  const end = new Date(`${endKey}T12:00:00${COSTA_RICA_OFFSET}`);

  return {
    view,
    anchorKey: startKey,
    startKey,
    endKey,
    label: formatWeekRange(start, end),
    isCurrent: startKey === current.startKey,
  };
}

export function adjacentPeriodKey(period: DemoPeriod, delta: -1 | 1): string {
  if (period.view === DEMO_VIEW.MONTH) {
    return shiftMonthKey(period.startKey, delta);
  }
  return addCalendarDays(period.startKey, delta * 7);
}

export function buildDemoHref(view: DemoView, fecha?: string): string {
  const params = new URLSearchParams();
  params.set("vista", view);
  if (fecha) params.set("fecha", fecha);
  return `/demo?${params.toString()}`;
}
