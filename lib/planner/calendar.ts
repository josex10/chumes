import { addCalendarDays, todayInCostaRica } from "@/lib/follow-ups/calendar";

const MONTH_KEY = /^\d{4}-\d{2}$/;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export const PLANNER_WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

export type PlannerGridDay = {
  dateKey: string;
  inMonth: boolean;
};

export type PlannerMonthGrid = {
  monthKey: string;
  startKey: string;
  endKey: string;
  days: PlannerGridDay[];
};

export function parsePlannerMonth(
  value: string | undefined,
  todayKey = todayInCostaRica(),
): string {
  if (value && MONTH_KEY.test(value)) {
    const month = Number(value.slice(5, 7));
    if (month >= 1 && month <= 12) return value;
  }

  return todayKey.slice(0, 7);
}

export function lastDayOfMonth(monthKey: string): number {
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7));
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function addMonths(monthKey: string, delta: number): string {
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7));
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${nextYear}-${nextMonth}`;
}

export function getPlannerMonthGrid(monthKey: string): PlannerMonthGrid {
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7));
  const firstKey = `${monthKey}-01`;
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const lead = firstDow === 0 ? 6 : firstDow - 1;
  const startKey = addCalendarDays(firstKey, -lead);
  const lastDate = lastDayOfMonth(monthKey);
  const lastKey = `${monthKey}-${String(lastDate).padStart(2, "0")}`;
  const lastDow = new Date(Date.UTC(year, month - 1, lastDate)).getUTCDay();
  const trail = lastDow === 0 ? 0 : 7 - lastDow;
  const endKey = addCalendarDays(lastKey, trail);

  const days: PlannerGridDay[] = [];
  for (let index = 0; index < 42; index += 1) {
    const dateKey = addCalendarDays(startKey, index);
    days.push({
      dateKey,
      inMonth: dateKey.slice(0, 7) === monthKey,
    });
    if (dateKey === endKey) break;
  }

  return { monthKey, startKey, endKey, days };
}

export function parsePlannerDay(
  value: string | undefined,
  grid: PlannerMonthGrid,
  todayKey = todayInCostaRica(),
): string {
  if (value && DATE_KEY.test(value) && grid.days.some((day) => day.dateKey === value)) {
    return value;
  }

  if (grid.days.some((day) => day.dateKey === todayKey && day.inMonth)) {
    return todayKey;
  }

  return `${grid.monthKey}-01`;
}

export function shiftPlannerMonth(
  monthKey: string,
  dayKey: string,
  delta: number,
): { month: string; day: string } {
  const month = addMonths(monthKey, delta);
  const requested = Number(dayKey.slice(8, 10));
  const dayNumber = Number.isFinite(requested) && requested > 0 ? requested : 1;
  const clamped = Math.min(dayNumber, lastDayOfMonth(month));
  return {
    month,
    day: `${month}-${String(clamped).padStart(2, "0")}`,
  };
}

export function buildPlannerHref(month: string, day: string): string {
  const params = new URLSearchParams();
  params.set("month", month);
  params.set("day", day);
  return `/planificador?${params.toString()}`;
}
