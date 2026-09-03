import type { DatesStatus } from "@/lib/events/dates-status";
import {
  COSTA_RICA_OFFSET,
  COSTA_RICA_TIMEZONE,
} from "@/lib/follow-ups/calendar";

const eventDateFormatter = new Intl.DateTimeFormat("es-CR", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const deliveryPickupFormatter = new Intl.DateTimeFormat("es-CR", {
  timeZone: COSTA_RICA_TIMEZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const datetimeLocalPartsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: COSTA_RICA_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function parseStoredDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getFormatPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function toDatetimeLocalValue(value: string | null | undefined): string {
  if (!value) return "";
  const date = parseStoredDate(value);
  if (!date) return "";

  const parts = datetimeLocalPartsFormatter.formatToParts(date);
  const year = getFormatPart(parts, "year");
  const month = getFormatPart(parts, "month");
  const day = getFormatPart(parts, "day");
  const hour = getFormatPart(parts, "hour");
  const minute = getFormatPart(parts, "minute");
  if (!year || !month || !day || !hour || !minute) return "";

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function fromDatetimeLocalValue(
  value: string | undefined | null,
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const match = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/,
  );
  if (!match) return null;

  const date = new Date(
    `${match[1]}T${match[2]}:${match[3]}:${match[4] ?? "00"}${COSTA_RICA_OFFSET}`,
  );
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

export function formatEventDate(value: string | null | undefined): string | null {
  if (!value) return null;

  const dateKey = value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey) && !value.includes("T")) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return eventDateFormatter.format(
      new Date(Date.UTC(year, month - 1, day, 12)),
    );
  }

  const date = parseStoredDate(value);
  if (!date) return null;
  return eventDateFormatter.format(date);
}

export function formatDeliveryPickupDateTime(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const date = parseStoredDate(value);
  if (!date) return null;
  return deliveryPickupFormatter.format(date);
}

export function formatDatesStatusLabel(status: DatesStatus): string {
  switch (status) {
    case "COMPLETE":
      return "Completo";
    case "PARTIAL":
      return "Parcial";
    case "UNKNOWN":
      return "Pendiente";
  }
}

export function getDatesStatusVariant(
  status: DatesStatus,
): "success" | "warning" | "muted" {
  switch (status) {
    case "COMPLETE":
      return "success";
    case "PARTIAL":
      return "warning";
    case "UNKNOWN":
      return "muted";
  }
}
