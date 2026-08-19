import type { DatesStatus } from "@/lib/events/dates-status";

const eventDateFormatter = new Intl.DateTimeFormat("es-CR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const deliveryPickupFormatter = new Intl.DateTimeFormat("es-CR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function parseStoredDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDatetimeLocalValue(value: string | null | undefined): string {
  if (!value) return "";
  const date = parseStoredDate(value);
  if (!date) return "";

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(
  value: string | undefined | null,
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

export function formatEventDate(value: string | null | undefined): string | null {
  if (!value) return null;
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
