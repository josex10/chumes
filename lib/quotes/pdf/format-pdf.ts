import { COSTA_RICA_TIMEZONE } from "@/lib/follow-ups/calendar";

const PDF_MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

function pdfCalendarParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const dayPeriod = value("dayPeriod").toLowerCase() === "pm" ? "p. m." : "a. m.";

  return {
    date: `${Number(value("day"))} de ${PDF_MONTHS[Number(value("month")) - 1]} de ${value("year")}`,
    time: `${value("hour")}:${value("minute")} ${dayPeriod}`,
  };
}

export function formatPdfCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat("es-CR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  // Helvetica in react-pdf does not render the colón symbol (₡) correctly.
  return `CRC ${formatted}`;
}

export function formatPdfDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-CR", {
    timeZone: value.includes("T") ? COSTA_RICA_TIMEZONE : "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatPdfTaxRate(rate: number): string {
  if (rate <= 0) return "Exento";
  return `${Math.round(rate * 10000) / 100}%`;
}

export function formatPdfDateTime(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("es-CR", {
    timeZone: COSTA_RICA_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatPdfEventDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;

  return pdfCalendarParts(
    date,
    value.includes("T") ? COSTA_RICA_TIMEZONE : "UTC",
  ).date;
}

export function formatPdfScheduleDateTime(
  value: string | null | undefined,
): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const parts = pdfCalendarParts(date, COSTA_RICA_TIMEZONE);
  return `${parts.date}, ${parts.time}`;
}
