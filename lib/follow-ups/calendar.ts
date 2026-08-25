export const COSTA_RICA_TIMEZONE = "America/Costa_Rica";
const COSTA_RICA_OFFSET = "-06:00";

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: COSTA_RICA_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toCostaRicaDateKey(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return dateKeyFormatter.format(date);
}

export function todayInCostaRica(): string {
  return toCostaRicaDateKey(new Date());
}

export function addCalendarDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  const y = result.getUTCFullYear();
  const m = String(result.getUTCMonth() + 1).padStart(2, "0");
  const d = String(result.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateKeyToIso(dateKey: string): string {
  return new Date(`${dateKey}T12:00:00${COSTA_RICA_OFFSET}`).toISOString();
}

export function diffCalendarDays(fromKey: string, toKey: string): number {
  const [fromYear, fromMonth, fromDay] = fromKey.split("-").map(Number);
  const [toYear, toMonth, toDay] = toKey.split("-").map(Number);
  const from = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const to = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.round((to - from) / 86_400_000);
}

export function formatDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString("es-CR", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDueLabel(dueDateKey: string, todayKey: string): string {
  const daysUntilDue = diffCalendarDays(todayKey, dueDateKey);

  if (daysUntilDue === 0) return "Hoy";
  if (daysUntilDue === 1) return "Mañana";
  if (daysUntilDue > 1) return `En ${daysUntilDue} días`;
  if (daysUntilDue === -1) return "Ayer";
  return `Hace ${Math.abs(daysUntilDue)} días`;
}
