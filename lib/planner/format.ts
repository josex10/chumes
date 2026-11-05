import { formatEventDate } from "@/lib/events/format-dates";
import { COSTA_RICA_TIMEZONE } from "@/lib/follow-ups/calendar";

const monthFormatter = new Intl.DateTimeFormat("es-CR", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

const deliveryTimeFormatter = new Intl.DateTimeFormat("es-CR", {
  timeZone: COSTA_RICA_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatPlannerMonthLabel(monthKey: string): string {
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7));
  return capitalize(
    monthFormatter.format(new Date(Date.UTC(year, month - 1, 1, 12))),
  );
}

export function formatPlannerDayLabel(dateKey: string): string {
  return capitalize(formatEventDate(dateKey) ?? dateKey);
}

export function formatPlannerDeliveryTime(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return deliveryTimeFormatter.format(date);
}
